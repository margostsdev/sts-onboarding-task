import '@shopify/ui-extensions/preact';
import {render} from "preact";

// 1. Export the extension
export default async () => {
  render(<Extension />, document.body)
};

function Extension() {


  // 3. Render a UI
  return <s-banner>Your extension</s-banner>;

}
