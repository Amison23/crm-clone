import { getCurrentEmployee } from '@/lib/auth/current-employee';
import { notFound, redirect } from 'next/navigation';
import { features } from '@/lib/features';
import { VisualBotBuilderClient } from './visual-bot-builder-client';

/**
 * Server component wrapper.
 * Resolves company from the employees table (never user_metadata).
 * No role gate — any authenticated employee with a company may manage their FAQs.
 */
export default async function VisualBotBuilderPage() {
  if (!features.botBuilder) {
    notFound();
  }

  const employee = await getCurrentEmployee();
  if (!employee) redirect('/auth/login');
  if (!employee.companyId) redirect('/protected');

  return <VisualBotBuilderClient tenantId={employee.companyId} />;
}
