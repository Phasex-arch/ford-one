import { useState } from 'react';
import type { ContactFormData, ContactFormErrors } from '../types/landing.types';
import { isValidEmail, isValidPhone, hasMinLength } from '../../../shared/utils/validators';
import { formatPhone } from '../../../shared/utils/formatters';
import { submitContactForm } from '../services/landing.service';

const INITIAL: ContactFormData = {
  nome: '', email: '', telefone: '',
  cidade: '', interesse: '', veiculo: '', mensagem: '',
};

/**
 * Gerencia estado, validação e envio do formulário de contato.
 */
export function useContactForm() {
  const [form, setForm]       = useState<ContactFormData>(INITIAL);
  const [errors, setErrors]   = useState<ContactFormErrors>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const setField = (field: keyof ContactFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePhoneInput = (value: string) => {
    setField('telefone', formatPhone(value));
  };

  const validate = (): boolean => {
    const errs: ContactFormErrors = {};
    if (!form.nome.trim())                  errs.nome      = 'Informe seu nome.';
    else if (!hasMinLength(form.nome, 3))   errs.nome      = 'Nome muito curto.';
    if (!form.email.trim())                 errs.email     = 'Informe seu e-mail.';
    else if (!isValidEmail(form.email))     errs.email     = 'E-mail inválido.';
    if (!form.telefone.trim())              errs.telefone  = 'Informe seu telefone.';
    else if (!isValidPhone(form.telefone))  errs.telefone  = 'Telefone inválido.';
    if (!form.cidade.trim())                errs.cidade    = 'Informe sua cidade.';
    if (!form.interesse)                    errs.interesse = 'Selecione um interesse.';
    if (!form.veiculo.trim())               errs.veiculo   = 'Informe o veículo de interesse.';
    else if (!hasMinLength(form.veiculo, 2)) errs.veiculo  = 'Nome do veículo muito curto.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');
    try {
      await submitContactForm(form);
      setSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Não foi possível enviar sua mensagem.');
    } finally {
      setLoading(false);
    }
  };

  return { form, errors, success, loading, submitError, setField, handlePhoneInput, handleSubmit };
}
