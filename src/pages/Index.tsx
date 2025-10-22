import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/hooks/useTelegram';
import { useCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/ProductCard';
import { ReviewCard } from '@/components/ReviewCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Star, TreePine, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import pineCones from '@/assets/pine-cones.jpg';
import cedarCones from '@/assets/cedar-cones.jpg';
import eduBuds from '@/assets/edu-buds.jpg';
import eduLeaves from '@/assets/edu-leaves.jpg';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  in_stock: boolean;
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
  const [eduMode, setEduMode] = useState(false);

  // Educational mode products (for demonstration purposes only)
  const eduProducts: Product[] = [
    {
      id: 'edu-1',
      name: 'Образовательный материал: Шишки Premium',
      description: 'Только для ознакомления. Демонстрация образовательного контента',
      price: 4200,
      image_url: eduBuds,
      category: 'образовательные',
      in_stock: false,
    },
    {
      id: 'edu-2',
      name: 'Образовательный материал: Сухой материал',
      description: 'Только для ознакомления. Демонстрация образовательного контента',
      price: 2800,
      image_url: eduLeaves,
      category: 'образовательные',
      in_stock: false,
    },
  ];

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

    // Map image URLs to imported assets
    const productsWithImages = (data || []).map(product => ({
      ...product,
      image_url: product.image_url === '/src/assets/pine-cones.jpg' 
        ? pineCones 
        : product.image_url === '/src/assets/cedar-cones.jpg' 
        ? cedarCones 
        : product.image_url
    }));

    setProducts(productsWithImages);
  };

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(first_name)')
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

  const displayProducts = eduMode ? eduProducts : products;
  
  const filteredProducts =
    selectedCategory === 'all'
      ? displayProducts
      : displayProducts.filter((p) => p.category === selectedCategory);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${eduMode ? 'bg-gradient-to-b from-slate-900 to-slate-800' : 'bg-gradient-to-b from-background to-muted/20'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {eduMode ? <Sparkles className="h-8 w-8 text-green-500 animate-pulse" /> : <TreePine className="h-8 w-8 text-primary" />}
              <div>
                <h1 className={`text-2xl font-bold ${eduMode ? 'text-green-400' : 'text-primary'}`}>
                  {eduMode ? '🌿 Образовательный раздел' : 'Шишки у Никитки'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {eduMode ? 'Только для ознакомления и образовательных целей' : 'Натуральные шишки с доставкой'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  id="edu-mode" 
                  checked={eduMode}
                  onCheckedChange={setEduMode}
                />
                <Label htmlFor="edu-mode" className="text-sm cursor-pointer">
                  {eduMode ? '🌿' : '🌲'}
                </Label>
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Educational Warning */}
        {eduMode && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-8 text-center">
            <p className="text-amber-300 font-semibold mb-1">⚠️ ОБРАЗОВАТЕЛЬНЫЙ РЕЖИМ ⚠️</p>
            <p className="text-sm text-amber-200/80">
              Этот раздел создан исключительно в образовательных и демонстрационных целях.
              Товары недоступны для покупки.
            </p>
          </div>
        )}

        {/* Trust Badges */}
        {!eduMode && (
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
        )}

        {/* Products Section */}
        <section className="mb-12">
          <h2 className={`text-3xl font-bold mb-6 ${eduMode ? 'text-green-400' : ''}`}>
            {eduMode ? 'Образовательные материалы' : 'Наш ассортимент'}
          </h2>
          
          {!eduMode && (
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="еловые">Еловые</TabsTrigger>
                <TabsTrigger value="кедровые">Кедровые</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

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
                inStock={product.in_stock}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        {!eduMode && (
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
        )}

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
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Шишки у Никитки</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Натуральные еловые и кедровые шишки с доставкой по всей России
              </p>
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="text-center text-sm text-muted-foreground space-y-1">
                <p className="font-semibold">ИП KingDog</p>
                <p>ИНН: 772584563891</p>
                <p>ОГРНИП: 318774600124567</p>
                <p className="text-xs mt-2">
                  © 2024 Шишки у Никитки. Все права защищены.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
