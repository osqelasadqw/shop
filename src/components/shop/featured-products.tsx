              <div className="relative h-48 sm:h-60 md:h-72 overflow-hidden">
                <Image
                  src={p.images[0] || '/placeholder.png'}
                  alt={p.name}
                  fill
                  className="object-contain"
                  loading={index < 2 ? "eager" : "lazy"}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/placeholder.png';
                  }}
                />
              </div> 