import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";

import { PRODUCT_STATUSES, type ProductStatus } from "../constants/product";
import { capitalize } from "../utils/capitalize";

type UpdateStatusActionData =
  | { ok: true; product: { id: string; status: string } }
  | { ok: false; error: string }
  | { product?: unknown; variant?: unknown };

interface ProductStatusModalProps {
  productId: string;
  status: ProductStatus;
}

const ProductStatusModal = ({ productId, status }: ProductStatusModalProps) => {
  const modalId = `modal-${productId.replace(/[^a-zA-Z0-9]/g, "-")}`;
  const closeButtonDomId = `${modalId}-close`;
  const fetcher = useFetcher<UpdateStatusActionData>();
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus>(status);
  const prevFetcherState = useRef(fetcher.state);

  useEffect(() => {
    const prev = prevFetcherState.current;
    prevFetcherState.current = fetcher.state;
    const wasBusy = prev === "submitting" || prev === "loading";
    if (!wasBusy || fetcher.state !== "idle") return;
    const data = fetcher.data;
    if (data && "ok" in data && data.ok === true) {
      document.getElementById(closeButtonDomId)?.click();
    }
  }, [fetcher.state, fetcher.data, closeButtonDomId]);

  const handleStatusChange = (value: ProductStatus) => {
    setSelectedStatus(value);
  };

  const handleUpdate = () => {
    const fd = new FormData();
    fd.set("intent", "updateProductStatus");
    fd.set("productId", productId);
    fd.set("productStatus", selectedStatus);
    fetcher.submit(fd, { method: "post" });
  };

  const isSubmitting = fetcher.state !== "idle";
  const actionError =
    fetcher.state === "idle" &&
    fetcher.data &&
    "ok" in fetcher.data &&
    fetcher.data.ok === false &&
    "error" in fetcher.data
      ? fetcher.data.error
      : null;

  return (
    <>
      <s-button
        icon="edit"
        variant="tertiary"
        commandFor={modalId}
      />

      <s-modal id={modalId} heading="Update product status">
          <s-select label="Status" name="productStatus" onChange={(e) => handleStatusChange(e.currentTarget.value as ProductStatus)}>
            {PRODUCT_STATUSES.map((s) => (
              <s-option key={s} value={s} selected={s === selectedStatus}>
                {capitalize(s)}
              </s-option>
            ))}
          </s-select>

        {actionError ? (
          <s-text tone="critical">{actionError}</s-text>
        ) : null}

        <s-button
          id={closeButtonDomId}
          slot="secondary-actions"
          commandFor={modalId}
          command="--hide"
        >
          Close
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          disabled={isSubmitting}
          onClick={handleUpdate}
        >
          {isSubmitting ? "Updating…" : "Update"}
        </s-button>
      </s-modal>
    </>
  );
};

export default ProductStatusModal;
