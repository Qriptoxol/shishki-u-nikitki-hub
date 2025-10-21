import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface ReviewCardProps {
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

export const ReviewCard = ({ rating, comment, userName, createdAt }: ReviewCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < rating ? 'fill-accent text-accent' : 'text-muted'
                }`}
              />
            ))}
          </div>
          <span className="font-semibold text-sm">{userName}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{comment}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(createdAt).toLocaleDateString('ru-RU')}
        </p>
      </CardContent>
    </Card>
  );
};
