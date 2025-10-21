import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useTelegram } from '@/hooks/useTelegram';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalAmount, clearCart } = useCart();
  const { user, isInTelegram } = useTelegram();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    contactPhone: '',
    comment: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Корзина пуста',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Get or create user profile
      let userId: string | null = null;
      
      if (isInTelegram && user) {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('telegram_id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!profile) {
          // Create profile for Telegram user
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              telegram_id: user.id,
              username: user.username,
              first_name: user.first_name,
              last_name: user.last_name,
            })
            .select()
            .single();

          if (createError) throw createError;
          userId = newProfile.id;
        } else {
          userId = profile.id;
        }
      } else {
        // For web users without Telegram, require authentication
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          toast({
            title: 'Требуется авторизация',
            description: 'Пожалуйста, войдите в систему для оформления заказа',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        userId = authUser.id;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: getTotalAmount(),
          delivery_address: formData.deliveryAddress,
          contact_phone: formData.contactPhone,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send notification to Telegram bot
      if (isInTelegram && user) {
        await supabase.functions.invoke('telegram-bot', {
          body: {
            action: 'notify_order',
            telegram_id: user.id,
            order_id: order.id,
            total: getTotalAmount(),
          },
        });
      }

      clearCart();
      
      toast({
        title: 'Заказ оформлен!',
        description: 'Мы свяжемся с вами в ближайшее время',
      });

      navigate('/');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось оформить заказ. Попробуйте позже.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/cart')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Вернуться в корзину
        </Button>

        <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Данные для доставки</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="address">Адрес доставки *</Label>
                    <Textarea
                      id="address"
                      required
                      value={formData.deliveryAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, deliveryAddress: e.target.value })
                      }
                      placeholder="Укажите полный адрес доставки"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Контактный телефон *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.contactPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, contactPhone: e.target.value })
                      }
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>

                  <div>
                    <Label htmlFor="comment">Комментарий к заказу</Label>
                    <Textarea
                      id="comment"
                      value={formData.comment}
                      onChange={(e) =>
                        setFormData({ ...formData, comment: e.target.value })
                      }
                      placeholder="Дополнительная информация для курьера"
                      rows={3}
                    />
                  </div>

                  {isInTelegram && user && (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Заказ будет привязан к вашему Telegram аккаунту: @{user.username || user.first_name}
                      </p>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? 'Оформление...' : 'Подтвердить заказ'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Ваш заказ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-semibold">
                        {(item.price * item.quantity).toFixed(2)} ₽
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-4 flex justify-between text-lg font-bold">
                    <span>Итого:</span>
                    <span>{getTotalAmount().toFixed(2)} ₽</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
