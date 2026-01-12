import { forwardRef } from 'react';
import { Github, Mail, Phone, Terminal, Linkedin } from 'lucide-react';
import { TECH_KEYWORDS, type ParsedResume } from '@/lib/resumeTemplates';

interface GeekTemplateProps {
  data: ParsedResume;
}

// 高亮技术关键词
function highlightTechTerms(text: string): React.ReactNode[] {
  const words = text.split(/(\s+)/);
  return words.map((word, i) => {
    const cleanWord = word.replace(/[^a-zA-Z0-9+#]/g, '');
    if (TECH_KEYWORDS.some(kw => kw.toLowerCase() === cleanWord.toLowerCase())) {
      return (
        <code
          key={i}
          style={{
            backgroundColor: '#f1f5f9',
            color: '#db2777',
            padding: '2px 4px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace'
          }}
        >
          {word}
        </code>
      );
    }
    return word;
  });
}

export const GeekTemplate = forwardRef<HTMLDivElement, GeekTemplateProps>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="resume-a4 bg-white"
        style={{ 
          padding: '20mm',
          fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
          color: '#1e293b',
          fontSize: '12px',
          lineHeight: '1.5'
        }}
      >
        {/* Header - 终端风格 */}
        <header style={{ 
          marginBottom: '24px', 
          padding: '16px', 
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Terminal style={{ width: '20px', height: '20px', color: '#64748b' }} />
            <span style={{ fontSize: '13px', color: '#64748b' }}>~/resume</span>
          </div>
          
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#10b981' }}>{'>'}_</span>
            {data.name}
          </h1>
          <p style={{ color: '#475569', marginLeft: '28px', fontSize: '14px' }}>{data.title}</p>
          
          {/* 联系信息 */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '12px', 
            marginTop: '12px', 
            marginLeft: '28px',
            fontSize: '11px'
          }}>
            {data.email && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569' }}>
                <Mail style={{ width: '12px', height: '12px' }} />
                {data.email}
              </span>
            )}
            {data.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569' }}>
                <Phone style={{ width: '12px', height: '12px' }} />
                {data.phone}
              </span>
            )}
            {data.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4f46e5' }}
              >
                {link.label === 'GitHub' ? (
                  <Github style={{ width: '12px', height: '12px' }} />
                ) : (
                  <Linkedin style={{ width: '12px', height: '12px' }} />
                )}
                {link.label}
              </a>
            ))}
          </div>
        </header>

        {/* 双栏布局 */}
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* 左侧 - 70% */}
          <div style={{ flex: 7 }}>
            {/* 工作经历 */}
            <section style={{ marginBottom: '20px' }} className="resume-section">
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                color: '#1e293b',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#94a3b8' }}>##</span>
                Experience
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.experience.map((exp, index) => (
                  <div key={index} style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div>
                        <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{exp.role}</h3>
                        <p style={{ fontSize: '11px', color: '#64748b' }}>{exp.company}</p>
                      </div>
                      <code style={{ 
                        fontSize: '11px', 
                        backgroundColor: '#f1f5f9', 
                        color: '#475569',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {exp.period}
                      </code>
                    </div>
                    <ul style={{ marginTop: '8px', listStyle: 'none', padding: 0 }}>
                      {exp.highlights.map((item, i) => (
                        <li key={i} style={{ 
                          fontSize: '11px', 
                          color: '#334155', 
                          lineHeight: '1.6',
                          display: 'flex',
                          marginBottom: '4px'
                        }}>
                          <span style={{ color: '#10b981', marginRight: '8px' }}>→</span>
                          <span>{highlightTechTerms(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* 项目经验 */}
            {data.projects && data.projects.length > 0 && (
              <section className="resume-section">
                <h2 style={{ 
                  fontSize: '13px', 
                  fontWeight: 700, 
                  color: '#1e293b',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: '#94a3b8' }}>##</span>
                  Projects
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.projects.map((project, index) => (
                    <div key={index} style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '16px' }}>
                      <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{project.name}</h3>
                      <p style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>{project.description}</p>
                      {project.tech && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                          {project.tech.map((t, i) => (
                            <span
                              key={i}
                              style={{
                                backgroundColor: '#eef2ff',
                                color: '#4338ca',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '10px'
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* 右侧 - 30% */}
          <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 技能栈 */}
            <section className="resume-section">
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                color: '#1e293b',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#94a3b8' }}>##</span>
                Skills
              </h2>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {data.skills.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#eef2ff',
                      color: '#4338ca',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      border: '1px solid #e0e7ff'
                    }}
                  >
                    {`<${skill}/>`}
                  </span>
                ))}
              </div>
            </section>

            {/* 教育背景 */}
            <section className="resume-section">
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                color: '#1e293b',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#94a3b8' }}>##</span>
                Education
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: '11px' }}>{edu.school}</h3>
                    <p style={{ fontSize: '11px', color: '#475569' }}>{edu.degree}</p>
                    <code style={{ fontSize: '10px', color: '#64748b' }}>{edu.period}</code>
                  </div>
                ))}
              </div>
            </section>

            {/* 个人简介 */}
            {data.summary && (
              <section className="resume-section">
                <h2 style={{ 
                  fontSize: '13px', 
                  fontWeight: 700, 
                  color: '#1e293b',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: '#94a3b8' }}>##</span>
                  About
                </h2>
                <p style={{ fontSize: '11px', color: '#475569', lineHeight: '1.6' }}>
                  {data.summary}
                </p>
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer style={{ 
          marginTop: '24px', 
          paddingTop: '16px', 
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '10px', color: '#94a3b8' }}>
            {'// Generated with Resume Alchemist'}
          </p>
        </footer>
      </div>
    );
  }
);

GeekTemplate.displayName = 'GeekTemplate';
