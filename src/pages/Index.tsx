import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/hooks/useTelegram';
import { useCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/ProductCard';
import { ReviewCard } from '@/components/ReviewCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Star, TreePine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    first_name: string;
  };
}

const Index = () => {
  const navigate = useNavigate();
  const { user, isInTelegram } = useTelegram();
  const { addItem, getTotalItems } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadProducts();
    loadReviews();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить товары',
        variant: 'destructive',
      });
      return;
    }

    setProducts(data || []);
  };

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(first_name)')
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Error loading reviews:', error);
      return;
    }

    setReviews(data || []);
  };

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    addItem({
      productId: product.id,
      price: product.price,
      name: product.name,
      imageUrl: product.image_url,
    });

    toast({
      title: 'Добавлено в корзину',
      description: product.name,
    });
  };

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TreePine className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Шишки у Никитки</h1>
                <p className="text-xs text-muted-foreground">Натуральные шишки с доставкой</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-accent">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-card p-6 rounded-lg border text-center">
            <Star className="h-8 w-8 text-accent mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Проверенный продавец</h3>
            <p className="text-sm text-muted-foreground">Более 500 довольных клиентов</p>
          </div>
          <div className="bg-card p-6 rounded-lg border text-center">
            <TreePine className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Натуральный продукт</h3>
            <p className="text-sm text-muted-foreground">Собрано вручную в экологически чистых лесах</p>
          </div>
          <div className="bg-card p-6 rounded-lg border text-center">
            <ShoppingCart className="h-8 w-8 text-secondary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Быстрая доставка</h3>
            <p className="text-sm text-muted-foreground">Доставка по всей России</p>
          </div>
        </div>

        {/* Products Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Наш ассортимент</h2>
          
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="еловые">Еловые</TabsTrigger>
              <TabsTrigger value="кедровые">Кедровые</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                imageUrl={product.image_url}
                category={product.category}
                stock={product.stock}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Отзывы наших клиентов</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                rating={review.rating}
                comment={review.comment}
                userName={review.profiles?.first_name || 'Покупатель'}
                createdAt={review.created_at}
              />
            ))}
          </div>
        </section>

        {/* Telegram User Info (for debugging) */}
        {isInTelegram && user && (
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Telegram ID: {user.id} | {user.first_name}
            </p>
          </div>
        )}
      </main>

      <footer className="bg-card border-t mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Шишки у Никитки. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
