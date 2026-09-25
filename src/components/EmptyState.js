export default function EmptyState({ message = "No products found.", action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
      <p>{message}</p>
      {action}
    </div>
  );
}
