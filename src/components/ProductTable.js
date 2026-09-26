"use client";

import Link from "next/link";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";

export default function ProductTable({ products, onDelete }) {
  return (
    <table className="hidden w-full text-left text-sm md:table">
      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
        <tr>
          <th className="px-4 py-3">Image</th>
          <th className="px-4 py-3">Title</th>
          <th className="px-4 py-3">Category</th>
          <th className="px-4 py-3">Price</th>
          <th className="px-4 py-3">Rating</th>
          <th className="px-4 py-3">Stock</th>
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {products.map((p) => (
          <tr key={p.id} className="hover:bg-gray-50">
            <td className="px-4 py-2">
              {/* plain <img>: product thumbnails come from an external,
                  unpredictable CDN, so next/image's domain allowlist +
                  optimizer isn't worth the friction here */}
              <img
                src={p.thumbnail || PLACEHOLDER_IMAGE}
                alt={p.title}
                className="h-10 w-10 rounded object-cover"
              />
            </td>
            <td className="px-4 py-2 font-medium text-gray-900">
              <Link href={`/products/${p.id}`} className="hover:underline">
                {p.title}
              </Link>
            </td>
            <td className="px-4 py-2 capitalize text-gray-600">{p.category}</td>
            <td className="px-4 py-2">${p.price}</td>
            <td className="px-4 py-2">{p.rating}</td>
            <td className="px-4 py-2">{p.stock}</td>
            <td className="px-4 py-2">
              <div className="flex gap-3">
                <Link
                  href={`/products/${p.id}/edit`}
                  className="text-sky-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(p)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}