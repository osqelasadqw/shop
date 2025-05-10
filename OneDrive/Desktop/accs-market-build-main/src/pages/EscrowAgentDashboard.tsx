import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isEscrowAgent } from '@/services/roleService';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import { RefreshCw, MessageSquare, Users } from 'lucide-react';
import { ref, get, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { sendMessageAsEscrowAgent } from '@/services/realtimeChatService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AgreedUser {
  id: string;
  chatRoomId: string;
  buyerName: string;
  sellerName: string;
  buyerId: string;
  sellerId: string;
  channelName: string;
  price: number;
  agreedAt: number;
  messageId: string;
}

interface EscrowRequest {
  id: string;
  chatRoomId: string;
  requesterId: string;
  requesterName: string;
  requestTimestamp: number;
  participants: string[];
  status: 'active' | 'completed' | 'cancelled';
  productId?: string;
}

const EscrowAgentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAgent, setIsAgent] = useState(false);
  const [agreedUsers, setAgreedUsers] = useState<AgreedUser[]>([]);
  const [escrowRequests, setEscrowRequests] = useState<EscrowRequest[]>([]);
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null);
  const [agentMessage, setAgentMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (!currentUser || !currentUser.email) {
        navigate('/');
        return;
      }

      try {
        const agent = await isEscrowAgent(currentUser.email);
        setIsAgent(agent);

        if (!agent) {
          toast.error('თქვენ არ გაქვთ წვდომა ამ გვერდზე');
          navigate('/');
        } else {
          fetchAgreedUsers();
          fetchAllEscrowRequests();
        }
      } catch (error) {
        console.error('Error checking agent status:', error);
        navigate('/');
      }
    };

    checkRole();
  }, [currentUser, navigate]);

  const fetchAgreedUsers = async () => {
    try {
      setLoading(true);
      
      // ვიპოვოთ ყველა შეტყობინება, რომელსაც აქვს "purchase-request" ტიპი და "agreed" სტატუსი
      
      // 1. ჯერ ვიპოვოთ ყველა ჩატის ოთახი rtdb-დან
      const chatRoomsRef = ref(rtdb, 'chatRooms');
      const chatRoomsSnapshot = await get(chatRoomsRef);
      
      const agreedUsersData: AgreedUser[] = [];
      
      if (chatRoomsSnapshot.exists()) {
        const roomPromises = Object.keys(chatRoomsSnapshot.val()).map(async (roomId) => {
          // 2. თითოეული ოთახისთვის ვიპოვოთ შეტყობინებები
          const messagesRef = ref(rtdb, `messages/${roomId}`);
          const messagesSnapshot = await get(messagesRef);
          
          if (messagesSnapshot.exists()) {
            const messages = messagesSnapshot.val();
            
            // 3. ფილტრაცია: ვიპოვოთ "purchase-request" ტიპის შეტყობინებები "agreed" სტატუსით
            const purchaseRequests = Object.entries(messages)
              .filter(([_, messageData]: [string, any]) => 
                messageData.messageType === 'purchase-request' && 
                messageData.status === 'agreed'
              );
            
            // 4. თუ შეტყობინებები ნაპოვნია, დავამატოთ ინფორმაცია სიაში
            for (const [messageId, messageData] of purchaseRequests) {
              try {
                // გამოვყოთ ინფორმაცია შეტყობინების ტექსტიდან
                const text = messageData.text;
                const channelNameMatch = text.match(/Request to Purchase (.*?)(?:\n|$)/);
                const priceMatch = text.match(/Transaction Amount: \$(\d+(?:\.\d+)?)/);
                
                const channelName = channelNameMatch ? channelNameMatch[1] : 'Unknown Channel';
                const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
                
                agreedUsersData.push({
                  id: `${roomId}_${messageId}`,
                  chatRoomId: roomId,
                  buyerName: messageData.senderName,
                  sellerName: '', // არსებული მონაცემებიდან ვერ ვიღებთ, მაგრამ შეგვიძლია მოვძებნოთ მიმღები
                  buyerId: messageData.senderId,
                  sellerId: messageData.recipientId,
                  channelName,
                  price,
                  agreedAt: messageData.timestamp,
                  messageId
                });
              } catch (error) {
                console.error('Error parsing message data:', error);
              }
            }
          }
        });
        
        await Promise.all(roomPromises);
      }
      
      // დალაგება დროის მიხედვით (ახლიდან ძველისკენ)
      agreedUsersData.sort((a, b) => b.agreedAt - a.agreedAt);
      
      setAgreedUsers(agreedUsersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching agreed users:', error);
      setLoading(false);
      toast.error('მონაცემების ჩატვირთვა ვერ მოხერხდა');
    }
  };

  // მოვიძიოთ ყველა აქტიური escrow მოთხოვნა
  const fetchAllEscrowRequests = async () => {
    try {
      setLoading(true);
      
      // ვუსმენთ escrowRequests ნოდს realtime db-ში
      const escrowRequestsRef = ref(rtdb, 'escrowRequests');
      
      // ერთჯერადი მოთხოვნა
      const snapshot = await get(escrowRequestsRef);
      
      if (snapshot.exists()) {
        const requestsData = snapshot.val();
        const requestsList: EscrowRequest[] = Object.entries(requestsData)
          .map(([id, data]: [string, any]) => ({
            id,
            chatRoomId: data.chatRoomId,
            requesterId: data.requesterId,
            requesterName: data.requesterName || 'Unknown',
            requestTimestamp: data.requestTimestamp,
            participants: data.participants || [],
            status: data.status || 'active',
            productId: data.productId
          }))
          .filter(request => request.status === 'active')
          .sort((a, b) => b.requestTimestamp - a.requestTimestamp);
          
        setEscrowRequests(requestsList);
        console.log('Fetched escrow requests:', requestsList);
      } else {
        setEscrowRequests([]);
      }
      
      // ასევე დავაყენოთ მუდმივი მაყურებელი ცვლილებებისთვის
      const unsubscribe = onValue(escrowRequestsRef, (snapshot) => {
        if (snapshot.exists()) {
          const requestsData = snapshot.val();
          const requestsList: EscrowRequest[] = Object.entries(requestsData)
            .map(([id, data]: [string, any]) => ({
              id,
              chatRoomId: data.chatRoomId,
              requesterId: data.requesterId,
              requesterName: data.requesterName || 'Unknown',
              requestTimestamp: data.requestTimestamp,
              participants: data.participants || [],
              status: data.status || 'active',
              productId: data.productId
            }))
            .filter(request => request.status === 'active')
            .sort((a, b) => b.requestTimestamp - a.requestTimestamp);
            
          setEscrowRequests(requestsList);
        } else {
          setEscrowRequests([]);
        }
      });
      
      // გასუფთავება კომპონენტის დემონტაჟისას
      return () => unsubscribe();
      
    } catch (error) {
      console.error('Error fetching escrow requests:', error);
      toast.error('მოთხოვნების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  // შეტყობინების გაგზავნა აგენტის სახელით
  const handleSendAgentMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agentMessage.trim() || !activeChatRoomId) return;
    
    try {
      setSendingMessage(true);
      await sendMessageAsEscrowAgent(agentMessage, activeChatRoomId);
      setAgentMessage(''); // გავასუფთაოთ ველი წარმატებული გაგზავნის შემდეგ
      toast.success('შეტყობინება გაიგზავნა აგენტის სახელით');
    } catch (error) {
      console.error('Error sending message as escrow agent:', error);
      toast.error('შეტყობინების გაგზავნა ვერ მოხერხდა');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ka-GE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const goToChat = (chatRoomId: string) => {
    // გადავამისამართოთ მომხმარებელი ჩატის გვერდზე შესაბამისი ID-ით
    navigate(`/messages?room=${chatRoomId}`);
  };

  // მომხმარებლების რაოდენობა ჩატში
  const getParticipantsCount = (participants: string[]) => {
    if (!participants) return 0;
    // არ ვითვლით escrow_agent-ს და system-ს
    return participants.filter(p => p !== 'escrow_agent' && p !== 'system').length;
  };

  if (!isAgent) {
    return (
      <div className="bg-dark min-h-screen">
        <Header />
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold text-white">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Escrow Agent Dashboard</h1>
          
          <Button 
            variant="outline" 
            onClick={fetchAllEscrowRequests}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'იტვირთება...' : 'განახლება'}
          </Button>
        </div>
        
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="requests">მოთხოვნები</TabsTrigger>
            <TabsTrigger value="transactions">ტრანზაქციები</TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card className="bg-dark-card border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">აქტიური მოთხოვნები</CardTitle>
                    <CardDescription className="text-gray-400">
                      სულ {escrowRequests.length} მოთხოვნა
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-[500px] overflow-y-auto p-0">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                      </div>
                    ) : escrowRequests.length > 0 ? (
                      <div className="divide-y divide-gray-700">
                        {escrowRequests.map(request => (
                          <div 
                            key={request.id} 
                            className={`p-4 cursor-pointer hover:bg-dark-lighter transition-all ${
                              activeChatRoomId === request.chatRoomId ? 'bg-dark-lighter border-l-4 border-purple-500' : ''
                            }`}
                            onClick={() => goToChat(request.chatRoomId)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium text-white">{request.requesterName}</h3>
                              <span className="text-xs text-gray-400">
                                {formatDate(request.requestTimestamp)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Users size={14} />
                              <span>{getParticipantsCount(request.participants)} მონაწილე</span>
                            </div>
                            {request.productId && (
                              <div className="mt-1 text-xs text-gray-400">
                                პროდუქტი: {request.productId.substring(0, 10)}...
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-400">
                        აქტიური მოთხოვნები არ არის
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card className="bg-dark-card border-gray-700 h-full">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {activeChatRoomId ? 'ესკროუ აგენტის ჩატი' : 'აირჩიეთ მოთხოვნა'}
                    </CardTitle>
                    {activeChatRoomId && (
                      <CardDescription className="text-gray-400">
                        ჩატის ID: {activeChatRoomId.substring(0, 10)}...
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {activeChatRoomId ? (
                      <form onSubmit={handleSendAgentMessage} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-medium">Escrow Agent</span>
                          <span className="text-xs bg-green-600/30 text-green-400 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        </div>
                        <div className="bg-dark rounded-lg p-4 mb-4">
                          <p className="text-gray-300 text-sm">
                            ყველა შეტყობინება გაიგზავნება Escrow Agent-ის სახელით. 
                            მომხმარებლები ვერ გაარჩევენ თუ რომელი კონკრეტული აგენტი წერს.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Input 
                            placeholder="დაწერეთ მესიჯი როგორც Escrow Agent..."
                            className="flex-1 bg-dark border-gray-700 text-white"
                            value={agentMessage}
                            onChange={(e) => setAgentMessage(e.target.value)}
                            disabled={sendingMessage}
                          />
                          <Button 
                            type="submit" 
                            disabled={sendingMessage || !agentMessage.trim()}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {sendingMessage ? 'იგზავნება...' : 'გაგზავნა'}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-500 mb-4" />
                        <p className="text-gray-400">
                          ჩატის სანახავად აირჩიეთ მოთხოვნა სიიდან
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions">
            <div className="bg-dark-card rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">შეთანხმებული ტრანზაქციები</h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : agreedUsers.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  აქტიური შეთანხმებები არ არის
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white">არხის სახელი</TableHead>
                        <TableHead className="text-white">ფასი</TableHead>
                        <TableHead className="text-white">მყიდველი</TableHead>
                        <TableHead className="text-white">შეთანხმების დრო</TableHead>
                        <TableHead className="text-white">მოქმედება</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agreedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium text-white">
                            {user.channelName}
                          </TableCell>
                          <TableCell className="text-white">${user.price.toFixed(2)}</TableCell>
                          <TableCell className="text-white">{user.buyerName}</TableCell>
                          <TableCell className="text-white">{formatDate(user.agreedAt)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => goToChat(user.chatRoomId)}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              ჩატზე გადასვლა
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EscrowAgentDashboard; 