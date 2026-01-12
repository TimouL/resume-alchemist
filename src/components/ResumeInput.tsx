import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ResumeInputProps {
  onSubmit: (content: string) => void;
  isLoading: boolean;
}

export function ResumeInput({ onSubmit, isLoading }: ResumeInputProps) {
  const [content, setContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim());
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      const text = await file.text();
      setContent(text);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-all duration-300',
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="在这里粘贴你的简历内容，或拖拽文本文件到此处...

示例格式：

# 个人信息
张三 | 5年工作经验 | 北京

# 工作经历
**高级前端工程师** @ 某科技公司 (2021-至今)
- 负责核心业务系统的前端架构设计
- 主导了组件库的从0到1建设

# 项目经验
**电商平台重构项目**
- 使用React + TypeScript重构了老旧的jQuery项目
- 优化了首屏加载速度..."
          className="min-h-[300px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm scrollbar-thin"
        />
        
        {!content && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="p-4 rounded-full bg-muted/50">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-sm">拖拽文件或粘贴简历内容</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>{content.length} 字</span>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isLoading}
          className="btn-ai-glow text-primary-foreground"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              AI 分析中...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              开始 AI 体检
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
