import '@shopify/ui-extensions/preact';
import {render} from "preact";
import {useState} from "preact/hooks";
import {useApplyAttributeChange} from '@shopify/ui-extensions/checkout/preact';

const MAX_COMMENT_LENGTH = 200;

function getCommentError(value) {
  if (value.length > MAX_COMMENT_LENGTH) {
    return `This field can contain a maximum of ${MAX_COMMENT_LENGTH} characters`;
  }
}

// 1. Export the extension
export default async () => {
  render(<Extension />, document.body)
};

function Extension() {
  const applyAttributeChanges = useApplyAttributeChange()
  const [comment, setComment] = useState("");
  const [error, setError] = useState(null);

  const handleChange = (value) => {
    setComment(value);
    setError(getCommentError(value) ?? null);
  }

  const handleInput = (event) => {
    const target = /** @type {HTMLTextAreaElement} */ (event.currentTarget);
    handleChange(target.value);
  }

  const handleApply = async () => {
    const validationError = getCommentError(comment);
    if (validationError) {
      setError(validationError);
      return;
    }

    await applyAttributeChanges({
      type: 'updateAttribute',
      key: 'Order Comment',
      value: comment
    })
  }

  const isApplyDisabled = !comment.trim() || Boolean(error);

  // Render a UI
  return (
    <s-form onSubmit={handleApply}>
      <s-grid gap="small" gridTemplateColumns="1fr auto">
        <s-grid-item>
          <s-text-area
            label="Order comment"
            value={comment}
            rows={1}
            error={error ?? undefined}
            onInput={handleInput}/>
        </s-grid-item>

        <s-grid-item>
          <s-button type="submit" variant="primary" disabled={isApplyDisabled}>
            Apply
          </s-button>
        </s-grid-item>
      </s-grid>
    </s-form>
  )

}
