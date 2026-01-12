import { motion } from 'framer-motion';
import { Check, Sparkles, Building2, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ResumeTemplate, ParsedResume } from '@/lib/resumeTemplates';

interface ResumeTemplatePreviewProps {
  template: ResumeTemplate;
  isSelected: boolean;
  onClick: () => void;
  resumeData?: ParsedResume;
}

const templateIcons = {
  minimal: Sparkles,
  elite: Building2,
  geek: Terminal,
};

const templateColors = {
  minimal: 'from-gray-50 to-white border-gray-200',
  elite: 'from-slate-50 to-white border-slate-300',
  geek: 'from-slate-100 to-slate-50 border-indigo-200',
};

export function ResumeTemplatePreview({
  template,
  isSelected,
  onClick,
  resumeData,
}: ResumeTemplatePreviewProps) {
  const Icon = templateIcons[template.style];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all',
        isSelected
          ? 'border-primary shadow-lg shadow-primary/20'
          : 'border-border/50 hover:border-primary/50'
      )}
    >
      {/* 选中标记 */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      {/* 预览区域 */}
      <div className={cn(
        'aspect-[210/297] p-3 bg-gradient-to-b',
        templateColors[template.style]
      )}>
        <div className="w-full h-full rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100">
          {/* 模拟简历内容 */}
          <div className="p-3 h-full flex flex-col">
            {/* Header 模拟 */}
            <div className={cn(
              'mb-2 pb-2',
              template.style === 'minimal' && 'text-center',
              template.style === 'elite' && 'border-b-2 border-gray-900',
              template.style === 'geek' && 'bg-slate-50 rounded p-2'
            )}>
              <div className={cn(
                'font-bold text-xs mb-0.5',
                template.style === 'geek' && 'flex items-center gap-1'
              )}>
                {template.style === 'geek' && (
                  <span className="text-emerald-500 text-[8px]">{'>_'}</span>
                )}
                {resumeData?.name || '张三'}
              </div>
              <div className="text-[6px] text-gray-500">
                {resumeData?.title || '高级软件工程师'}
              </div>
            </div>

            {/* 内容模拟 */}
            <div className={cn(
              'flex-1 space-y-2',
              template.style === 'geek' && 'flex gap-2'
            )}>
              {template.style === 'geek' ? (
                <>
                  {/* 极客双栏 */}
                  <div className="flex-[7] space-y-1">
                    <div className="text-[5px] text-slate-400">## Experience</div>
                    <div className="space-y-0.5">
                      {[1, 2].map(i => (
                        <div key={i} className="h-1.5 bg-slate-100 rounded w-full" />
                      ))}
                    </div>
                  </div>
                  <div className="flex-[3] space-y-1">
                    <div className="text-[5px] text-slate-400">## Skills</div>
                    <div className="flex flex-wrap gap-0.5">
                      {['React', 'Go', 'K8s'].map(s => (
                        <span key={s} className="bg-indigo-50 text-indigo-600 px-1 rounded text-[4px]">
                          {`<${s}/>`}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* 单栏布局 */}
                  <div>
                    <div className={cn(
                      'text-[5px] mb-1',
                      template.style === 'minimal' && 'text-gray-400 tracking-widest uppercase',
                      template.style === 'elite' && 'font-bold border-b border-gray-200 pb-0.5'
                    )}>
                      {template.style === 'minimal' ? 'EXPERIENCE' : 'Experience'}
                    </div>
                    <div className="space-y-0.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-1 bg-gray-100 rounded w-full" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className={cn(
                      'text-[5px] mb-1',
                      template.style === 'minimal' && 'text-gray-400 tracking-widest uppercase',
                      template.style === 'elite' && 'font-bold border-b border-gray-200 pb-0.5'
                    )}>
                      {template.style === 'minimal' ? 'SKILLS' : 'Skills'}
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-1.5 w-4 bg-gray-100 rounded" />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 模板信息 */}
      <div className="p-3 bg-card border-t border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-sm">{template.name}</h4>
        </div>
        <p className="text-[10px] text-muted-foreground italic mb-1">{template.nameEn}</p>
        <p className="text-xs text-muted-foreground">{template.description}</p>
      </div>
    </motion.div>
  );
}
