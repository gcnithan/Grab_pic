import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Download, Image as ImageIcon } from 'lucide-react';

export default function Gallery() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  // Mock results
  const photos = [
    { id: 1, url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=400&fit=crop' },
    { id: 2, url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&h=600&fit=crop' },
    { id: 3, url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop' },
    { id: 4, url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=500&fit=crop' },
    { id: 5, url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop' },
  ];

  useEffect(() => {
    // Simulate network fetch
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in min-h-[calc(100vh-4rem)]">
      
      {/* Header Sticky */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border sticky top-16 bg-background/80 backdrop-blur z-20">
        <div className="flex items-center space-x-4">
          <Link to={`/join`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Photos</h1>
            <p className="text-sm text-muted-foreground flex items-center mt-0.5">
              <ImageIcon className="w-4 h-4 mr-1.5" />
              Event: {id}
            </p>
          </div>
        </div>
        
        {!loading && (
          <Button variant="outline" className="hidden sm:flex glass shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Download All ({photos.length})
          </Button>
        )}
      </div>

      {loading ? (
        // Skeleton Loaders mimicking Masonry layout
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="bg-muted animate-pulse rounded-2xl w-full break-inside-avoid shadow-inner"
              style={{ height: `${Math.random() * 200 + 150}px` }}
            />
          ))}
        </div>
      ) : (
        <>
          {/* Status Bar */}
          <div className="mb-6 flex items-center text-sm font-medium animate-slide-up text-primary bg-primary/10 w-fit px-4 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
            Found {photos.length} matches in 1.2s
          </div>

          {/* Masonry Layout */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className="relative group break-inside-avoid rounded-2xl overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
              >
                <img 
                  src={photo.url} 
                  alt={`Match ${photo.id}`} 
                  className="w-full h-auto object-cover rounded-2xl"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                  <span className="text-white text-xs font-medium bg-white/20 backdrop-blur-md px-2 py-1 rounded-md">
                    High Confidence
                  </span>
                  <Button size="icon" variant="glass" className="h-8 w-8 rounded-full border-none">
                    <Download className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Download All CTA */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:hidden z-50">
            <Button className="shadow-2xl shadow-primary/40 rounded-full px-8 h-14">
              <Download className="w-5 h-5 mr-2" />
              Download All
            </Button>
          </div>
        </>
      )}

    </div>
  );
}
