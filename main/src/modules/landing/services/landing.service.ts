import type { ContactFormData } from '../types/landing.types';
import { apiRequest } from '../../../shared/api/client';

export async function submitContactForm(data: ContactFormData): Promise<void> {
  await apiRequest('/public/leads', {
    method: 'POST',
    body: JSON.stringify({
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      veiculoInteresse: data.veiculo,
      mensagem: [
        data.mensagem.trim() || 'Solicitou contato pelo portal Ford One.',
        `Interesse: ${data.interesse}`,
        `Cidade: ${data.cidade}`,
      ].join('\n'),
    }),
  });
}
