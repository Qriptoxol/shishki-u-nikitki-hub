import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
  onAddToCart: (id: string) => void;
}

export const ProductCard = ({
  id,
  name,
  description,
  price,
  imageUrl,
  category,
  inStock,
  onAddToCart,
}: ProductCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
          <Badge className="absolute top-2 right-2 bg-secondary">
            {category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">{price} ₽</span>
          <span className="text-sm text-muted-foreground">
            {inStock ? 'В наличии' : 'Нет в наличии'}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => onAddToCart(id)}
          disabled={!inStock}
          className="w-full"
          size="lg"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {inStock ? 'В корзину' : 'Нет в наличии'}
        </Button>
      </CardFooter>
    </Card>
  );
};
