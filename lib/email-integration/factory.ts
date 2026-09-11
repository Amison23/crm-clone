import { EmailProvider } from './provider.interface';
import { GoogleEmailProvider } from './providers/google.provider';
import { MicrosoftEmailProvider } from './providers/microsoft.provider';

export function getEmailProvider(providerName: 'google' | 'microsoft'): EmailProvider {
  switch (providerName) {
    case 'google':
      return new GoogleEmailProvider();
    case 'microsoft':
      return new MicrosoftEmailProvider();
    default:
      throw new Error(`Unsupported provider: ${providerName}`);
  }
}
