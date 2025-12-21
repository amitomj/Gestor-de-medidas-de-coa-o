
import { Processo, ProcessStatus } from '../types';

/**
 * Since docx library is heavy and complex for this context, 
 * we use the HTML-to-Word trick which is reliable for simple tables/reports.
 */
export const exportToWord = async (processos: Processo[], type: ProcessStatus) => {
  const title = type === 'pendente' ? 'Processos Pendentes - Medidas de Coação' : 'Processos Findos - Medidas de Coação';
  const fileName = `Relatorio_${type}_${new Date().toISOString().split('T')[0]}.doc`;

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: 'Calibri', sans-serif; font-size: 11pt; }
        h1 { color: #2e75b6; text-align: center; margin-bottom: 20px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .urgent { color: red; font-weight: bold; }
        .medida { background-color: #e2f0d9; padding: 2px 5px; margin-right: 5px; border-radius: 3px; font-size: 9pt; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Gerado em: ${new Date().toLocaleString('pt-PT')}</p>
      <table>
        <thead>
          <tr>
            <th>Processo</th>
            <th>Arguidos</th>
            <th>Crime / DIAP</th>
            <th>Medidas</th>
            <th>Revisão</th>
            <th>Máximo</th>
            <th>Procurador</th>
          </tr>
        </thead>
        <tbody>
          ${processos.map(p => {
            const now = new Date();
            const revDate = new Date(p.prazoRevisao);
            const diff = (revDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            const isUrgent = type === 'pendente' && diff <= 15;

            // Garantir tratamento de array em campos que podem ser strings em dados legados
            const crimeText = Array.isArray(p.crime) ? p.crime.join(', ') : p.crime;
            const arguidosText = Array.isArray(p.arguidos) ? p.arguidos.join(', ') : p.arguidos;
            const diapText = Array.isArray(p.diap) ? p.diap.join(', ') : p.diap;
            const medidasText = Array.isArray(p.medidasAplicadas) ? p.medidasAplicadas.join(', ') : p.medidasAplicadas;
            const procsText = Array.isArray(p.nomeProcurador) ? p.nomeProcurador.join(', ') : p.nomeProcurador;

            return `
              <tr>
                <td>${p.numeroProcesso}</td>
                <td><b>${arguidosText}</b></td>
                <td>${crimeText}<br/><small>${diapText}</small></td>
                <td>${medidasText}</td>
                <td class="${isUrgent ? 'urgent' : ''}">${revDate.toLocaleDateString('pt-PT')}</td>
                <td>${new Date(p.prazoMaximo).toLocaleDateString('pt-PT')}</td>
                <td>${procsText}<br/>${p.telefoneProcurador}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      ${processos.length === 0 ? '<p>Sem registos a apresentar.</p>' : ''}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
