import { forwardRef } from 'react';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import type { ParsedResume } from '@/lib/resumeTemplates';

interface EliteTemplateProps {
  data: ParsedResume;
}

export const EliteTemplate = forwardRef<HTMLDivElement, EliteTemplateProps>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="resume-a4 bg-white"
        style={{ 
          padding: '20mm',
          fontFamily: '"Source Sans 3", "Source Sans Pro", system-ui, sans-serif',
          color: '#111827',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
      >
        {/* Header - 左对齐 */}
        <header style={{ 
          marginBottom: '24px', 
          paddingBottom: '16px', 
          borderBottom: '2px solid #111827' 
        }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 700, 
            fontFamily: 'Merriweather, Georgia, serif',
            color: '#111827',
            marginBottom: '8px'
          }}>
            {data.name}
          </h1>
          
          {/* 联系信息 */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            gap: '16px',
            fontSize: '13px',
            color: '#4b5563'
          }}>
            {data.email && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail style={{ width: '14px', height: '14px' }} />
                {data.email}
              </span>
            )}
            {data.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone style={{ width: '14px', height: '14px' }} />
                {data.phone}
              </span>
            )}
            {data.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin style={{ width: '14px', height: '14px' }} />
                {data.location}
              </span>
            )}
            {data.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  color: '#1d4ed8',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px'
                }}
              >
                <ExternalLink style={{ width: '14px', height: '14px' }} />
                {link.label}
              </a>
            ))}
          </div>
        </header>

        {/* 个人简介 */}
        {data.summary && (
          <section style={{ marginBottom: '20px' }} className="resume-section">
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 700, 
              fontFamily: 'Merriweather, Georgia, serif',
              color: '#111827',
              marginBottom: '8px',
              paddingBottom: '4px',
              borderBottom: '1px solid #d1d5db'
            }}>
              Summary
            </h2>
            <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>
              {data.summary}
            </p>
          </section>
        )}

        {/* 工作经历 */}
        <section style={{ marginBottom: '20px' }} className="resume-section">
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 700, 
            fontFamily: 'Merriweather, Georgia, serif',
            color: '#111827',
            marginBottom: '12px',
            paddingBottom: '4px',
            borderBottom: '1px solid #d1d5db'
          }}>
            Professional Experience
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontFamily: 'Merriweather, Georgia, serif', color: '#111827', fontSize: '15px' }}>
                      {exp.company}
                      {exp.location && <span style={{ fontWeight: 400, color: '#4b5563' }}> — {exp.location}</span>}
                    </h3>
                    <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#374151' }}>{exp.role}</p>
                  </div>
                  <span style={{ fontSize: '13px', color: '#4b5563', whiteSpace: 'nowrap', textAlign: 'right' }}>
                    {exp.period}
                  </span>
                </div>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px' }}>
                  {exp.highlights.map((item, i) => (
                    <li key={i} style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5', marginBottom: '4px' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 教育背景 */}
        <section style={{ marginBottom: '20px' }} className="resume-section">
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 700, 
            fontFamily: 'Merriweather, Georgia, serif',
            color: '#111827',
            marginBottom: '12px',
            paddingBottom: '4px',
            borderBottom: '1px solid #d1d5db'
          }}>
            Education
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.education.map((edu, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontFamily: 'Merriweather, Georgia, serif', color: '#111827', fontSize: '15px' }}>{edu.school}</h3>
                  <p style={{ fontSize: '13px', color: '#374151' }}>
                    {edu.major && <span style={{ fontStyle: 'italic' }}>{edu.major}</span>}
                    {edu.degree && `, ${edu.degree}`}
                    {edu.gpa && ` — GPA: ${edu.gpa}`}
                  </p>
                </div>
                <span style={{ fontSize: '13px', color: '#4b5563', textAlign: 'right' }}>
                  {edu.period}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 专业技能 */}
        <section className="resume-section">
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 700, 
            fontFamily: 'Merriweather, Georgia, serif',
            color: '#111827',
            marginBottom: '8px',
            paddingBottom: '4px',
            borderBottom: '1px solid #d1d5db'
          }}>
            Skills
          </h2>
          
          <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>
            <span style={{ fontWeight: 600 }}>Technical:</span> {data.skills.join(', ')}
          </p>
        </section>
      </div>
    );
  }
);

EliteTemplate.displayName = 'EliteTemplate';
