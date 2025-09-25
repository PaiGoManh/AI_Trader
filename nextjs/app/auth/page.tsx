interface StatsCardProps {
  title: string;
  value: string;
}

export default function StatsCard({ title, value }: StatsCardProps) {
  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-3xl">{value}</p>
    </div>
  );
}
