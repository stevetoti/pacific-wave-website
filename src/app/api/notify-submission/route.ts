import { NextRequest, NextResponse } from 'next/server';

// Email notification for new project submissions
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const {
      contact_name,
      contact_email,
      contact_phone,
      company_name,
      project_type,
      budget_range,
      timeline,
      project_description,
    } = data;

    // Format the email content
    const projectTypeLabels: Record<string, string> = {
      'website': 'Website',
      'webapp': 'Web Application',
      'mobile': 'Mobile App',
      'ai': 'AI Automation',
      'social': 'Social Media',
      'full-package': 'Full Digital Package',
    };

    const budgetLabels: Record<string, string> = {
      '1000-3000': '$1,000 - $3,000',
      '3000-5000': '$3,000 - $5,000',
      '5000-10000': '$5,000 - $10,000',
      '10000-20000': '$10,000 - $20,000',
      '20000+': '$20,000+',
      'unsure': 'Not sure - needs quote',
    };

    const timelineLabels: Record<string, string> = {
      'asap': 'ASAP (Rush)',
      '1-2weeks': '1-2 weeks',
      '1month': '1 month',
      '2-3months': '2-3 months',
      '3months+': '3+ months',
      'flexible': 'Flexible',
    };

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #233C6F 0%, #1a2d52 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎯 New Project Inquiry</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="color: #EF5E33; margin-top: 0;">Contact Information</h2>
            <p><strong>Name:</strong> ${contact_name}</p>
            <p><strong>Email:</strong> <a href="mailto:${contact_email}">${contact_email}</a></p>
            ${contact_phone ? `<p><strong>Phone:</strong> <a href="tel:${contact_phone}">${contact_phone}</a></p>` : ''}
            ${company_name ? `<p><strong>Company:</strong> ${company_name}</p>` : ''}
          </div>
          
          <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="color: #EF5E33; margin-top: 0;">Project Details</h2>
            <p><strong>Type:</strong> ${projectTypeLabels[project_type] || project_type}</p>
            <p><strong>Budget:</strong> ${budgetLabels[budget_range] || budget_range || 'Not specified'}</p>
            <p><strong>Timeline:</strong> ${timelineLabels[timeline] || timeline || 'Not specified'}</p>
            ${project_description ? `<p><strong>Description:</strong> ${project_description}</p>` : ''}
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <a href="https://pacificwavedigital.com/admin/submissions" 
               style="display: inline-block; background: #EF5E33; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              View in Admin Panel →
            </a>
          </div>
        </div>
        
        <div style="background: #233C6F; padding: 20px; text-align: center;">
          <p style="color: white; margin: 0; font-size: 14px;">
            Pacific Wave Digital — Digital Innovation for the Pacific
          </p>
        </div>
      </div>
    `;

    // Send via Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Pacific Wave Digital <noreply@pacificwavedigital.com>',
          to: ['steve@pacificwavedigital.com'],
          cc: ['toti@pacificwavedigital.com'],
          subject: `🎯 New Project Inquiry: ${contact_name} - ${projectTypeLabels[project_type] || project_type}`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        console.error('Resend API error:', await response.text());
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
