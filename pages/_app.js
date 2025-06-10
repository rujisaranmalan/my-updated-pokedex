import { ApolloProvider } from '@apollo/client'
import { useApollo } from '../lib/apollo-client'
import Navbar from "../components/Navbar";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  const apolloClient = useApollo(pageProps.initialApolloState || {})

  return (
    <ApolloProvider client={apolloClient}>
      <div className="bg-gray-300">
        <Navbar />
        <Component {...pageProps} />
      </div>
    </ApolloProvider>
  );
}
