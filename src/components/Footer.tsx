// src/components/Footer.tsx
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-center text-sm text-gray-400 py-4 border-t border-gray-800">
      <p>
        Built by{" "}
        <a
          href="https://github.com/vjlive"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-400 underline hover:text-blue-300"
        >
          VJLIVE
        </a>{" "}
        • Powered by{" "}
        <a
          href="https://developer.algorand.org/docs/get-details/testnet/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-400 underline hover:text-blue-300"
        >
          Algorand Testnet
        </a>
      </p>
    </footer>
  );
};

export default Footer;
