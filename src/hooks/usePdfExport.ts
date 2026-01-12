import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = useCallback(async (
    element: HTMLElement | null,
    filename: string = '我的简历'
  ) => {
    if (!element) {
      toast.error('导出失败：无法找到简历内容');
      return;
    }

    setIsExporting(true);
    toast.loading('正在生成 PDF...', { id: 'pdf-export' });

    try {
      // 克隆元素以避免影响页面显示
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // 设置克隆元素的样式以确保正确渲染
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      clonedElement.style.top = '0';
      clonedElement.style.width = '210mm';
      clonedElement.style.minHeight = '297mm';
      clonedElement.style.backgroundColor = '#ffffff';
      clonedElement.style.color = '#000000';
      clonedElement.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
      
      // 确保所有文本元素有正确的颜色
      const allElements = clonedElement.querySelectorAll('*');
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const computedStyle = window.getComputedStyle(htmlEl);
        
        // 复制计算后的样式
        if (computedStyle.color) {
          htmlEl.style.color = computedStyle.color;
        }
        if (computedStyle.fontSize) {
          htmlEl.style.fontSize = computedStyle.fontSize;
        }
        if (computedStyle.fontWeight) {
          htmlEl.style.fontWeight = computedStyle.fontWeight;
        }
        if (computedStyle.fontFamily) {
          htmlEl.style.fontFamily = computedStyle.fontFamily;
        }
        if (computedStyle.lineHeight) {
          htmlEl.style.lineHeight = computedStyle.lineHeight;
        }
        if (computedStyle.letterSpacing) {
          htmlEl.style.letterSpacing = computedStyle.letterSpacing;
        }
        if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          htmlEl.style.backgroundColor = computedStyle.backgroundColor;
        }
      });

      document.body.appendChild(clonedElement);

      // 等待字体加载
      await document.fonts.ready;
      
      // 使用 html2canvas 将 DOM 转换为图片
      const canvas = await html2canvas(clonedElement, {
        scale: 3, // 提高清晰度
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: clonedElement.scrollWidth,
        height: clonedElement.scrollHeight,
        onclone: (clonedDoc) => {
          // 确保克隆文档中的样式正确
          const clonedEl = clonedDoc.body.querySelector('.resume-a4') as HTMLElement;
          if (clonedEl) {
            clonedEl.style.transform = 'none';
            clonedEl.style.margin = '0';
            clonedEl.style.boxShadow = 'none';
          }
        }
      });

      // 移除克隆元素
      document.body.removeChild(clonedElement);

      // A4 尺寸 (210mm x 297mm) 转换为像素 (96 DPI)
      const a4WidthPx = 794; // 210mm at 96 DPI
      const a4HeightPx = 1123; // 297mm at 96 DPI
      
      // 计算比例
      const imgWidth = 210; // mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // 创建 PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // 如果内容超过一页，需要分页
      const pageHeight = 297;
      let heightLeft = imgHeight;
      let position = 0;

      // 添加第一页
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // 添加后续页面（如果需要）
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      // 下载 PDF
      pdf.save(`${filename}.pdf`);
      
      toast.success('PDF 导出成功！', { id: 'pdf-export' });
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('PDF 导出失败，请重试', { id: 'pdf-export' });
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportToPdf, isExporting };
}
