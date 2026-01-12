import { forwardRef } from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import type { ParsedResume } from '@/lib/resumeTemplates';

interface MinimalistTemplateProps {
  data: ParsedResume;
}

export const MinimalistTemplate = forwardRef<HTMLDivElement, MinimalistTemplateProps>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="resume-a4 bg-white"
        style={{ 
          padding: '20mm',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          color: '#111827',
          fontSize: '14px',
          lineHeight: '1.6'
        }}
      >
        {/* Header - 居中对齐 */}
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 700, 
            letterSpacing: '-0.025em',
            color: '#111827',
            marginBottom: '12px'
          }}>
            {data.name}
          </h1>
          <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '16px' }}>
            {data.title}
          </p>
          
          {/* 联系信息 - 一行展示 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '16px',
            fontSize: '13px',
            color: '#6b7280'
          }}>
            {data.email && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail style={{ width: '14px', height: '14px' }} />
                {data.email}
              </span>
            )}
            {data.phone && (
              <>
                <span style={{ color: '#d1d5db' }}>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone style={{ width: '14px', height: '14px' }} />
                  {data.phone}
                </span>
              </>
            )}
            {data.location && (
              <>
                <span style={{ color: '#d1d5db' }}>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin style={{ width: '14px', height: '14px' }} />
                  {data.location}
                </span>
              </>
            )}
            {data.links.map((link, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#d1d5db', marginRight: '8px' }}>·</span>
                <a href={link.url} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280' }}>
                  <Globe style={{ width: '14px', height: '14px' }} />
                  {link.label}
                </a>
              </span>
            ))}
          </div>
        </header>

        {/* 个人简介 */}
        {data.summary && (
          <section style={{ marginBottom: '32px' }} className="resume-section">
            <h2 style={{ 
              fontSize: '11px', 
              fontWeight: 700, 
              letterSpacing: '0.1em',
              color: '#9ca3af',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              SUMMARY
            </h2>
            <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.7' }}>
              {data.summary}
            </p>
          </section>
        )}

        {/* 工作经历 */}
        <section style={{ marginBottom: '32px' }} className="resume-section">
          <h2 style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            letterSpacing: '0.1em',
            color: '#9ca3af',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
            WORK EXPERIENCE
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>{exp.company}</h3>
                    <p style={{ fontSize: '13px', color: '#4b5563' }}>{exp.role}</p>
                  </div>
                  <span style={{ fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {exp.period}
                  </span>
                </div>
                <ul style={{ marginTop: '8px', paddingLeft: '0', listStyle: 'none' }}>
                  {exp.highlights.map((item, i) => (
                    <li key={i} style={{ 
                      fontSize: '13px', 
                      color: '#4b5563', 
                      lineHeight: '1.7',
                      display: 'flex',
                      marginBottom: '6px'
                    }}>
                      <span style={{ color: '#9ca3af', marginRight: '8px' }}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 教育背景 */}
        <section style={{ marginBottom: '32px' }} className="resume-section">
          <h2 style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            letterSpacing: '0.1em',
            color: '#9ca3af',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
            EDUCATION
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.education.map((edu, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>{edu.school}</h3>
                  <p style={{ fontSize: '13px', color: '#4b5563' }}>
                    {edu.degree}
                    {edu.major && ` · ${edu.major}`}
                    {edu.gpa && ` · GPA: ${edu.gpa}`}
                  </p>
                </div>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>{edu.period}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 专业技能 */}
        <section className="resume-section">
          <h2 style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            letterSpacing: '0.1em',
            color: '#9ca3af',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
            SKILLS
          </h2>
          
          <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.7' }}>
            {data.skills.join(' · ')}
          </p>
        </section>
      </div>
    );
  }
);

MinimalistTemplate.displayName = 'MinimalistTemplate';
