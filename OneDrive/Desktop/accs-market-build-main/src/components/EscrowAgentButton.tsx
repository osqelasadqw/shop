import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Shield } from 'lucide-react';
import { sendMessageToEscrowAgent } from '@/services/realtimeChatService';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/Spinner';

interface EscrowAgentButtonProps {
  chatRoomId: string;
  productId?: string;
  disabled?: boolean;
  hasEscrowAgent?: boolean;
}

const EscrowAgentButton: React.FC<EscrowAgentButtonProps> = ({ 
  chatRoomId, 
  productId,
  disabled = false,
  hasEscrowAgent = false
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const callEscrowAgent = async () => {
    setLoading(true);
    
    try {
      console.log('💬 DEBUG: იწყება Escrow Agent-ის გამოძახება:', { 
        chatRoomId, 
        productId,
        hasEscrowAgent
      });
      
      // გავაგზავნოთ შეტყობინება Escrow Agent-თან
      await sendMessageToEscrowAgent(
        "გთხოვთ დამეხმაროთ ამ გარიგებაში. მჭირდება შუამავალი გარანტი უსაფრთხო გადახდისთვის.",
        chatRoomId,
        productId
      );
      
      console.log('💬 DEBUG: Escrow Agent წარმატებით იქნა გამოძახებული');
      
      toast({
        title: "Escrow Agent გამოძახებულია",
        description: "Escrow Agent შემოვა ჩატში და დაგეხმარებათ უსაფრთხო გარიგების განხორციელებაში",
      });
      
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('❌ ERROR: Escrow Agent-ის გამოძახებისას შეცდომა წარმოიშვა:', error);
      
      toast({
        title: "შეცდომა",
        description: "Escrow Agent-ის გამოძახებისას შეცდომა წარმოიშვა. გთხოვთ, სცადოთ მოგვიანებით.",
        variant: "destructive",
      });
      
    } finally {
      setLoading(false);
    }
  };

  if (hasEscrowAgent) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
        disabled={true}
      >
        <Shield className="mr-1 h-4 w-4" /> Escrow Agent აქტიურია
      </Button>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
          disabled={disabled}
        >
          <Shield className="mr-1 h-4 w-4" /> გამოიძახეთ Escrow Agent
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escrow Agent-ის გამოძახება</DialogTitle>
          <DialogDescription>
            ესკროუ აგენტი არის მესამე მხარე, რომელიც დაგეხმარებათ გარიგების უსაფრთხოდ განხორციელებაში.
            აგენტი შემოვა ამ ჩატში და დაგეხმარებათ ორივე მხარეს უსაფრთხო ტრანზაქციაში.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 py-4">
          <div className="grid flex-1 gap-2">
            <p className="text-sm text-gray-600">
              • აგენტი უზრუნველყოფს ფულის უსაფრთხო ჩადებას დეპოზიტზე <br />
              • გამყიდველი მიიღებს ფულს მხოლოდ პროდუქტის მიწოდების შემდეგ <br />
              • მყიდველს აქვს დრო შეამოწმოს პროდუქტი ფულის გადახდამდე <br />
              • აგენტი დაგეხმარებათ პრობლემების მოგვარებაში, თუ ასეთი წარმოიშობა
            </p>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              გაუქმება
            </Button>
          </DialogClose>
          <Button 
            type="submit" 
            onClick={callEscrowAgent} 
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? <Spinner className="mr-2" /> : <Shield className="mr-2 h-4 w-4" />}
            {loading ? 'გთხოვთ მოითმინოთ...' : 'გამოიძახეთ აგენტი'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EscrowAgentButton; 