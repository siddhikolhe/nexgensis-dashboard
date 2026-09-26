"use client";

import { useState } from "react";

const EMPTY = {
  title: "",
  category: "",
  price: "",
  stock: "",
  rating: "",
  thumbnail: "",
  description: "",
};

function validate(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = "Title is required";
  if (!values.category) errors.category = "Pick a category";
  if (values.price === "" || Number(values.price) <= 0)
    errors.price = "Price must be a positive number";
  if (values.stock === "" || Number(values.stock) < 0)
    errors.stock = "Stock can't be negative";
  if (values.rating !== "" && (Number(values.rating) < 0 || Number(values.rating) > 5))
    errors.rating = "Rating must be between 0 and 5";
  if (!values.description.trim()) errors.description = "Description is required";
  return errors;
}

export default function ProductForm({ initialValues, categories, onSubmit, submitLabel }) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // guard against double-submit from fast repeated clicks
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        price: Number(values.price),
        stock: Number(values.stock),
        rating: values.rating === "" ? 0 : Number(values.rating),
      });
    } finally {
      setSubmitting(false);
    }
  }

  const field = (name, label, type = "text") => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={values[name]}
        onChange={(e) => handleChange(name, e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm"
      />
      {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      {field("title", "Title")}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
        <select
          value={values.category}
          onChange={(e) => handleChange("category", e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {field("price", "Price ($)", "number")}
        {field("stock", "Stock", "number")}
        {field("rating", "Rating (0-5)", "number")}
      </div>

      {field("thumbnail", "Thumbnail URL")}
      <p className="-mt-3 text-xs text-gray-400">
        Leave blank to show a placeholder image.
      </p>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}