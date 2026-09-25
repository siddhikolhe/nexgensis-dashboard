"use client";

import Link from "next/link";

export default function ProductCardList({ products, onDelete }) {
  return (
    <div className="flex flex-col gap-3 p-4 md:hidden">
      {products.map((p) => (
        <div key={p.id} className="flex gap-3 rounded-lg border p-3">
          <img
            src={p.thumbnail}
            alt={p.title}
            className="h-16 w-16 rounded object-cover"
          />
          <div className="flex-1">
            <Link
              href={`/products/${p.id}`}
              className="font-medium text-gray-900 hover:underline"
            >
              {p.title}
            </Link>
            <p className="text-xs capitalize text-gray-500">{p.category}</p>
            <p className="text-sm text-gray-700">
              ${p.price} - Rating {p.rating} - Stock {p.stock}
            </p>
            <div className="mt-1 flex gap-3 text-sm">
              <Link href={`/products/${p.id}/edit`} className="text-sky-600">
                Edit
              </Link>
              <button onClick={() => onDelete(p)} className="text-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
