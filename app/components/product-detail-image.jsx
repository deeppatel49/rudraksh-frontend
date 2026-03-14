"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductDetailImage({ product }) {
  const [imageError, setImageError] = useState(false);
  const imageSrc = imageError ? "/products/default-medicine.svg" : (product.image || "/products/default-medicine.svg");

  return (
    <div className="product-detail-image-wrap">
      <Image
        src={imageSrc}
        alt={product.imageAlt || `${product.name} medicine`}
        width={300}
        height={300}
        className="product-detail-image"
        priority
        onError={(e) => {
          console.log("Image load error:", product.image);
          setImageError(true);
        }}
      />
    </div>
  );
}
