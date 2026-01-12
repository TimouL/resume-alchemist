import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Loader2, ArrowLeft, Copy, Check, Sparkles, BarChart3, Crown, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useResumeAI } from '@/hooks/useResumeAI';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getIndustryConfig } from '@/lib/constants';

interface PolishEditorProps {
  originalContent: string;
  industry: string;
  onBack: () => void;
  onExport?: (polishedContent: string) => void;
}

export function PolishEditor({ originalContent, industry, onBack, onExport }: PolishEditorProps) {
  const [selectedText, setSelectedText] = useState('');
  const [polishedResults, setPolishedResults] = useState<Record<string, string>>({});
  const [activeStyle, setActiveStyle] = useState<string | null>(null);
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);
  const [fullPolished, setFullPolished] = useState('');
  
  const { isLoading, polishFull, polishSentence } = useResumeAI();

  // 根据行业动态生成润色风格选项
  const polishStyles = useMemo(() => {
    const config = getIndustryConfig(industry);
    return [
      { id: 'standard', label: '标准专业版', icon: Sparkles, description: '语言简练专业' },
      { id: 'data', label: '数据驱动版', icon: BarChart3, description: `自动插入 ${config.dataPlaceholders[0]} 等占位符` },
      { id: 'expert', label: config.expertModeName, icon: Crown, description: '强调技术深度与行业影响力' },
    ] as const;
  }, [industry]);

  const handleTextSelect = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 5) {
      setSelectedText(text);
      setPolishedResults({});
      setActiveStyle(null);
    }
  };

  const handlePolishSentence = async (style: 'standard' | 'data' | 'expert') => {
    if (!selectedText) return;
    setActiveStyle(style);
    
    const result = await polishSentence(selectedText, industry, style);
    if (result) {
      setPolishedResults(prev => ({ ...prev, [style]: result.result }));
    }
    setActiveStyle(null);
  };

  const handlePolishFull = async () => {
    const result = await polishFull(originalContent, industry);
    if (result) {
      setFullPolished(result.polished);
      toast.success('全篇润色完成！');
    }
  };

  const handleCopy = (text: string, style: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStyle(style);
    toast.success('已复制到剪贴板');
    setTimeout(() => setCopiedStyle(null), 2000);
  };

  const renderHighlightedText = (text: string) => {
    // Highlight data placeholders like [提升了X%]
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span key={index} className="bg-primary/30 text-primary px-1 rounded font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-semibold">AI 智能润色</h2>
      </div>

      <Tabs defaultValue="sentence" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
          <TabsTrigger value="sentence">单句原子润色</TabsTrigger>
          <TabsTrigger value="full">一键全篇润色</TabsTrigger>
        </TabsList>

        <TabsContent value="sentence" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Original */}
            <div className="space-y-3">
              <h3 className="font-medium text-muted-foreground">原文（选中句子进行润色）</h3>
              <div 
                className="glass-card p-4 min-h-[300px] text-sm leading-relaxed cursor-text whitespace-pre-wrap"
                onMouseUp={handleTextSelect}
              >
                {originalContent}
              </div>
            </div>

            {/* Right: Polish Options */}
            <div className="space-y-4">
              <h3 className="font-medium text-muted-foreground">润色预览</h3>
              
              {selectedText ? (
                <>
                  <div className="glass-card p-4 bg-primary/5 border-primary/20">
                    <p className="text-sm font-medium text-primary mb-1">已选中：</p>
                    <p className="text-sm text-muted-foreground">{selectedText}</p>
                  </div>

                  <div className="space-y-3">
                    {polishStyles.map((style) => {
                      const Icon = style.icon;
                      const result = polishedResults[style.id];
                      const isLoading = activeStyle === style.id;

                      return (
                        <motion.div
                          key={style.id}
                          className={cn(
                            'glass-card p-4 space-y-3 transition-all',
                            result && 'border-primary/30'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-primary" />
                              <span className="font-medium text-sm">{style.label}</span>
                              <span className="text-xs text-muted-foreground">{style.description}</span>
                            </div>
                            {!result ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePolishSentence(style.id)}
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Wand2 className="w-3 h-3 mr-1" />
                                    生成
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopy(result, style.id)}
                              >
                                {copiedStyle === style.id ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                          
                          <AnimatePresence>
                            {result && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-sm leading-relaxed"
                              >
                                {renderHighlightedText(result)}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="glass-card p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                  <Wand2 className="w-10 h-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">在左侧选中一句话</p>
                  <p className="text-sm text-muted-foreground/60">获取 3 种风格的 AI 润色版本</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="full" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Original */}
            <div className="space-y-3">
              <h3 className="font-medium text-muted-foreground">原文</h3>
              <Textarea
                value={originalContent}
                readOnly
                className="min-h-[400px] resize-none bg-card/50 text-sm"
              />
            </div>

            {/* Right: Polished */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-muted-foreground">润色后</h3>
                {fullPolished && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(fullPolished, 'full')}
                  >
                    {copiedStyle === 'full' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        复制
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              {fullPolished ? (
                <div className="space-y-4">
                  <Textarea
                    value={fullPolished}
                    readOnly
                    className="min-h-[350px] resize-none bg-primary/5 border-primary/20 text-sm"
                  />
                  {onExport && (
                    <Button
                      onClick={() => onExport(fullPolished)}
                      className="w-full btn-ai-glow text-primary-foreground"
                      size="lg"
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      使用润色结果导出 PDF
                    </Button>
                  )}
                </div>
              ) : (
                <div className="glass-card min-h-[400px] flex flex-col items-center justify-center space-y-4">
                  <Button
                    onClick={handlePolishFull}
                    disabled={isLoading}
                    className="btn-ai-glow text-primary-foreground"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        AI 润色中...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        一键 STAR 法则重写
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    基于 STAR 法则优化全文表达
                  </p>
                  {onExport && (
                    <Button
                      onClick={() => onExport(originalContent)}
                      variant="outline"
                      size="lg"
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      直接导出模板
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
