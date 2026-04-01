interface StoryGroup {
  businessId: string;
  businessName: string;
  businessAvatar: string;
  stories: { id: string; image_url: string; caption: string | null }[];
}

interface StoryBarProps {
  groups: StoryGroup[];
  onView: (group: StoryGroup) => void;
}

const demoStories = [
  { name: 'Burger House', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop' },
  { name: 'Studio Bella', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop' },
  { name: 'TechStore', img: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=100&h=100&fit=crop' },
  { name: 'CrossFit', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop' },
  { name: 'Café Moka', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&h=100&fit=crop' },
];

export default function StoryBar({ groups, onView }: StoryBarProps) {
  const items = groups.length > 0
    ? groups.map(g => ({ name: g.businessName, img: g.businessAvatar, group: g }))
    : demoStories.map(d => ({
        name: d.name,
        img: d.img,
        group: {
          businessId: d.name,
          businessName: d.name,
          businessAvatar: d.img,
          stories: [{ id: d.name, image_url: d.img, caption: `Story de ${d.name}` }],
        } as StoryGroup,
      }));

  return (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 py-4">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => onView(item.group)}
          className="flex flex-col items-center gap-1.5 shrink-0 group"
        >
          <div className="w-16 h-16 rounded-2xl p-[2px] gradient-primary glow-sm group-active:scale-95 transition-transform">
            <div className="w-full h-full rounded-[14px] bg-card p-0.5">
              <img
                src={item.img || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop'}
                alt=""
                className="w-full h-full rounded-xl object-cover"
              />
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium max-w-[60px] truncate">
            {item.name}
          </span>
        </button>
      ))}
    </div>
  );
}
