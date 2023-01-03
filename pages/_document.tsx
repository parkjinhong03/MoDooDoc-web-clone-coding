import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
          <div id="clean-system-modal-portal" />
          <div id="review-bottom-navigator" />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
