
import { Processo, Procurador, Juiz } from '../types';

export const handleProcessAlert = async (processo: Processo, allProcuradores: Procurador[], allJuizes: Juiz[]) => {
  const formatDateICS = (dateStr: string) => {
    return dateStr.replace(/-/g, '') + 'T090000Z';
  };

  const formatDateGoogle = (dateStr: string) => {
    return dateStr.replace(/-/g, '') + 'T090000Z/' + dateStr.replace(/-/g, '') + 'T100000Z';
  };

  const arguidos = Array.isArray(processo.arguidos) ? processo.arguidos.join(', ') : (processo.arguidos || '');

  // URLs para Adicionar ao Calendário via Web (One-click)
  const googleUrlRev = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Revisão Medida: ' + processo.numeroProcesso)}&dates=${formatDateGoogle(processo.prazoRevisao)}&details=${encodeURIComponent('Arguidos: ' + arguidos)}`;
  const googleUrlMax = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Fim Medida: ' + processo.numeroProcesso)}&dates=${formatDateGoogle(processo.prazoMaximo)}&details=${encodeURIComponent('Arguidos: ' + arguidos)}`;
  
  const outlookUrlRev = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent('Revisão Medida: ' + processo.numeroProcesso)}&startdt=${processo.prazoRevisao}T09:00:00&enddt=${processo.prazoRevisao}T10:00:00&body=${encodeURIComponent('Arguidos: ' + arguidos)}`;

  const createEventICS = (title: string, date: string, description: string) => {
    return [
      'BEGIN:VEVENT',
      `DTSTART:${formatDateICS(date)}`,
      `DTEND:${formatDateICS(date)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT1440M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder',
      'END:VALARM',
      'END:VEVENT'
    ].join('\r\n');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GestorJudicial//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    createEventICS(`Revisão Medida: ${processo.numeroProcesso}`, processo.prazoRevisao, `Arguidos: ${arguidos}`),
    createEventICS(`Fim Medida: ${processo.numeroProcesso}`, processo.prazoMaximo, `Arguidos: ${arguidos}`),
    'END:VCALENDAR'
  ].join('\r\n');

  const fileName = `Alerta_${processo.numeroProcesso.replace(/[/.]/g, '_')}.ics`;
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const file = new File([blob], fileName, { type: 'text/calendar' });

  const emailsTo = [
    ...allProcuradores.filter(p => processo.nomeProcurador.includes(p.nome)).map(p => p.email),
    ...allJuizes.filter(j => processo.juiz.includes(j.nome)).map(j => j.email)
  ].filter(Boolean) as string[];

  const toList = emailsTo.join(',');
  const subject = `Alerta de Prazos - Processo ${processo.numeroProcesso}`;
  
  const bodyText = `Seguem os prazos para o processo ${processo.numeroProcesso}.\n\n` +
    `OPÇÃO 1: ADICIONAR AO CALENDÁRIO GOOGLE (Clique nos links abaixo):\n` +
    `- Agendar Revisão: ${googleUrlRev}\n` +
    `- Agendar Fim Medida: ${googleUrlMax}\n\n` +
    `OPÇÃO 2: ADICIONAR AO OUTLOOK WEB:\n` +
    `- Agendar Revisão: ${outlookUrlRev}\n\n` +
    `OPÇÃO 3: FICHEIRO ANEXO (.ics)\n` +
    `- Se o ficheiro não estiver anexado, utilize o ficheiro "${fileName}" que foi descarregado agora para a sua pasta de Downloads e abra-o para importar para o Outlook/Agenda Desktop.\n\n` +
    `Arguidos: ${arguidos}`;

  const fallbackEmail = () => {
    // Download do ficheiro
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Abrir Gmail ou Mailto
    setTimeout(() => {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toList)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
      const newWin = window.open(gmailUrl, '_blank');
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        window.location.href = `mailto:${toList}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
      }
    }, 500);
  };

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: subject, text: bodyText });
    } catch (err) {
      fallbackEmail();
    }
  } else {
    fallbackEmail();
  }
};
