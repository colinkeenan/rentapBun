import { hydrateRoot } from 'react-dom/client';
import Rentap from "./rentap.tsx"

const root = hydrateRoot(document.getElementById('root'), <Rentap icon={""} css={""} />);
