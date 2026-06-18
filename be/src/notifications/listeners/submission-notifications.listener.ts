import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User, UserRole } from '../../database/entities/user.entity';
import { NotificationsService } from '../notifications.service';
import { SubmissionCreatedEvent } from '../events/submission-created.event';
import { SubmissionResubmittedEvent } from '../events/submission-resubmitted.event';
import { SubmissionReviewedEvent } from '../events/submission-reviewed.event';

@Injectable()
export class SubmissionNotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  private async getAdmins(): Promise<User[]> {
    return this.userRepository.find({ where: { role: UserRole.ADMIN } });
  }

  private async sendSlackMessage(webhookUrl: string | undefined, payload: any) {
    if (!webhookUrl) {
      console.log('[Slack Notification Mock] Webhook URL not configured. Payload:', JSON.stringify(payload, null, 2));
      return;
    }
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error(`Failed to send Slack notification: ${res.statusText}`);
      }
    } catch (err) {
      console.error('Error sending Slack notification:', err);
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    const host = this.configService.get<string>('SMTP_HOST') || 'localhost';
    const port = Number(this.configService.get<string>('SMTP_PORT') || 1025);
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true';
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>('SMTP_FROM') || 'no-reply@glinteco.com';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
    });

    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      console.log(`[Email Sent] To: ${to}, Subject: ${subject}`);
    } catch (err) {
      console.log('[Email Notification Mock] SMTP delivery failed. Logging content instead:', {
        to,
        subject,
        html,
      });
    }
  }

  @OnEvent('submission.created')
  async handleSubmissionCreated(event: SubmissionCreatedEvent) {
    // 1. In-app notifications for admins
    const admins = await this.getAdmins();
    for (const admin of admins) {
      await this.notificationsService.create(
        admin.id,
        'submission_created',
        'Bài nộp mới cần chấm',
        `Học viên ${event.userName} đã nộp bài tập '${event.exerciseTitle}'`,
      );
    }

    // 2. Slack Notification to admins
    const slackPayload = {
      attachments: [
        {
          color: '#2563EB',
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🚀 New Exercise Submission Ready for Review',
                emoji: true,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Learner:* ${event.userName}\n*Track:* ${event.trackName}\n*Exercise:* ${event.exerciseTitle}\n*PR Link:* <${event.prUrl}|PR Link>`,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `📅 *Submitted At:* ${event.submittedAt.toISOString()}`,
                },
              ],
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'Review on Portal',
                    emoji: true,
                  },
                  style: 'primary',
                  url: `https://rampup.glinteco.com/admin/submissions/${event.submissionId}`,
                },
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'Open PR',
                    emoji: true,
                  },
                  url: event.prUrl,
                },
              ],
            },
          ],
        },
      ],
    };

    const adminWebhook = this.configService.get<string>('SLACK_ADMIN_WEBHOOK_URL');
    await this.sendSlackMessage(adminWebhook, slackPayload);

    // 3. Email Notification to admins
    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Submission Pending Review</title>
  <style>
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background-color: #F8FAFC;
      color: #0F172A;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      padding: 32px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
    }
    .header {
      background-color: #2563EB;
      color: #FFFFFF;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .content {
      padding: 32px 24px;
    }
    .meta-table {
      width: 100%;
      margin: 20px 0;
      border-collapse: collapse;
    }
    .meta-table td {
      padding: 10px 0;
      border-bottom: 1px solid #F1F5F9;
    }
    .meta-table td.label {
      font-weight: 600;
      color: #475569;
      width: 120px;
    }
    .meta-table td.value {
      color: #0F172A;
    }
    .btn-container {
      text-align: center;
      margin-top: 28px;
    }
    .btn-primary {
      display: inline-block;
      background-color: #2563EB;
      color: #FFFFFF;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #64748B;
      border-top: 1px solid #F1F5F9;
      background-color: #F8FAFC;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>RAMP UP Portal</h1>
      </div>
      <div class="content">
        <p style="font-size: 16px; line-height: 24px; margin-top: 0;">Hi Admins & Mentors,</p>
        <p style="font-size: 15px; color: #334155; line-height: 24px;">A learner has submitted a task for your review. Below are the details:</p>
        
        <table class="meta-table">
          <tr>
            <td class="label">Learner</td>
            <td class="value">${event.userName} (${event.userEmail})</td>
          </tr>
          <tr>
            <td class="label">Track</td>
            <td class="value">${event.trackName}</td>
          </tr>
          <tr>
            <td class="label">Exercise</td>
            <td class="value">${event.exerciseTitle}</td>
          </tr>
          <tr>
            <td class="label">PR Link</td>
            <td class="value"><a href="${event.prUrl}" style="color: #2563EB;">PR Link</a></td>
          </tr>
          <tr>
            <td class="label">Submitted</td>
            <td class="value">${event.submittedAt.toISOString()}</td>
          </tr>
        </table>
        
        <div class="btn-container">
          <a href="https://rampup.glinteco.com/admin/submissions/${event.submissionId}" class="btn-primary">Review Submission</a>
        </div>
      </div>
      <div class="footer">
        This is an automated email from RAMP UP Onboarding Portal.
      </div>
    </div>
  </div>
</body>
</html>`;

    for (const admin of admins) {
      await this.sendEmail(
        admin.email,
        `[RAMP UP] New Submission: ${event.userName} - ${event.exerciseTitle}`,
        emailHtml,
      );
    }
  }

  @OnEvent('submission.resubmitted')
  async handleSubmissionResubmitted(event: SubmissionResubmittedEvent) {
    // 1. In-app notifications for admins
    const admins = await this.getAdmins();
    for (const admin of admins) {
      await this.notificationsService.create(
        admin.id,
        'submission_resubmitted',
        'Bài nộp cập nhật lại',
        `Học viên ${event.userName} đã cập nhật lại bài nộp '${event.exerciseTitle}'`,
      );
    }

    // 2. Slack Notification to admins
    const slackPayload = {
      attachments: [
        {
          color: '#F59E0B',
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '⚠️ Resubmission Ready for Review',
                emoji: true,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Learner:* ${event.userName}\n*Track:* ${event.trackName}\n*Exercise:* ${event.exerciseTitle}\n*PR Link:* <${event.prUrl}|PR Link>`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Previous Feedback:*\n${event.previousComments.map((c) => `> _"${c}"_`).join('\n') || '> No comments'}`,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `📅 *Resubmitted At:* ${event.submittedAt.toISOString()}`,
                },
              ],
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'Review on Portal',
                    emoji: true,
                  },
                  style: 'primary',
                  url: `https://rampup.glinteco.com/admin/submissions/${event.submissionId}`,
                },
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'Open PR',
                    emoji: true,
                  },
                  url: event.prUrl,
                },
              ],
            },
          ],
        },
      ],
    };

    const adminWebhook = this.configService.get<string>('SLACK_ADMIN_WEBHOOK_URL');
    await this.sendSlackMessage(adminWebhook, slackPayload);

    // 3. Email Notification to admins
    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Resubmission Pending Review</title>
  <style>
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background-color: #F8FAFC;
      color: #0F172A;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      width: 100%;
      padding: 32px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
    }
    .header {
      background-color: #F59E0B;
      color: #FFFFFF;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
    }
    .content {
      padding: 32px 24px;
    }
    .feedback-box {
      background-color: #FFFBEB;
      border-left: 4px solid #F59E0B;
      padding: 16px;
      margin: 20px 0;
      color: #78350F;
      font-size: 14px;
    }
    .btn-container {
      text-align: center;
      margin-top: 28px;
    }
    .btn-primary {
      display: inline-block;
      background-color: #F59E0B;
      color: #FFFFFF;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #64748B;
      border-top: 1px solid #F1F5F9;
      background-color: #F8FAFC;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Resubmission Ready</h1>
      </div>
      <div class="content">
        <p style="font-size: 16px; line-height: 24px; margin-top: 0;">Hi Admins & Mentors,</p>
        <p style="font-size: 15px; color: #334155; line-height: 24px;">A learner has updated their PR link for your review.</p>
        
        <p><strong>Learner:</strong> ${event.userName}</p>
        <p><strong>Exercise:</strong> ${event.exerciseTitle}</p>
        <p><strong>PR Link:</strong> <a href="${event.prUrl}">${event.prUrl}</a></p>

        <div class="feedback-box">
          <strong>Previous Review Comments:</strong><br>
          ${event.previousComments.map(c => `- ${c}`).join('<br>') || 'None'}
        </div>
        
        <div class="btn-container">
          <a href="https://rampup.glinteco.com/admin/submissions/${event.submissionId}" class="btn-primary">Review Submission</a>
        </div>
      </div>
      <div class="footer">
        This is an automated email from RAMP UP Onboarding Portal.
      </div>
    </div>
  </div>
</body>
</html>`;

    for (const admin of admins) {
      await this.sendEmail(
        admin.email,
        `[RAMP UP] Resubmission: ${event.userName} - ${event.exerciseTitle}`,
        emailHtml,
      );
    }
  }

  @OnEvent('submission.reviewed')
  async handleSubmissionReviewed(event: SubmissionReviewedEvent) {
    // 1. In-app notification for the learner
    const title = event.status === 'approved' ? 'Bài tập đã được duyệt' : 'Bài tập cần sửa đổi';
    const body = event.status === 'approved'
      ? `Bài nộp cho '${event.exerciseTitle}' đã được duyệt bởi ${event.adminName}. Bạn được cộng +${event.xpAwarded} XP!`
      : `Người duyệt ${event.adminName} yêu cầu sửa đổi bài nộp '${event.exerciseTitle}'. Lý do: ${event.comment || 'Không có nhận xét'}`;

    await this.notificationsService.create(event.userId, 'submission_reviewed', title, body);

    // 2. Slack DM to learner (or mock log)
    const color = event.status === 'approved' ? '#10B981' : '#F59E0B';
    const headerText = event.status === 'approved'
      ? '✅ Exercise Approved! Excellent Work'
      : '⚠️ Changes Requested for Submission';

    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: headerText,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: event.status === 'approved'
            ? `Hi *${event.userName}*, your submission for *${event.exerciseTitle}* has been *Approved* by *${event.adminName}*.`
            : `Hi *${event.userName}*, reviewer *${event.adminName}* has requested changes on your submission for *${event.exerciseTitle}*.`,
        },
      },
    ];

    if (event.comment) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Review Feedback:*\n> _"${event.comment}"_`,
        },
      });
    }

    if (event.status === 'approved') {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `⭐ *Rewards & Gamification:*\n• *XP Gained:* \`+${event.xpAwarded} XP\`\n• *New Level:* \`Level ${event.newLevel} 🎓\` ${event.levelUpgraded ? '_(Leveled Up!)_' : ''}`,
        },
      });
    }

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: event.status === 'approved' ? 'Go to Dashboard' : 'Resubmit PR Link',
            emoji: true,
          },
          style: 'primary',
          url: event.status === 'approved'
            ? 'https://rampup.glinteco.com/dashboard'
            : `https://rampup.glinteco.com/exercises/${event.exerciseId}`,
        },
      ],
    });

    const slackPayload = { attachments: [{ color, blocks }] };
    // DM uses bot token + slackUserId. For this spec, we mock/log the DM
    console.log(`[Slack Direct Message to ${event.userName} (Slack ID: ${event.slackUserId || 'N/A'})]`, JSON.stringify(slackPayload, null, 2));

    // 3. Email Notification to learner
    let emailHtml = '';
    let subject = '';

    if (event.status === 'approved') {
      subject = `[RAMP UP] Review Approved: ${event.exerciseTitle} 🎉`;
      emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Submission Approved!</title>
  <style>
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background-color: #F8FAFC;
      color: #0F172A;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      width: 100%;
      padding: 32px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
    }
    .header {
      background-color: #10B981;
      color: #FFFFFF;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
    }
    .content {
      padding: 32px 24px;
    }
    .feedback-box {
      background-color: #F8FAFC;
      border-left: 4px solid #10B981;
      padding: 16px;
      margin: 20px 0;
      font-style: italic;
      color: #334155;
    }
    .gamification-box {
      background-color: #F5F3FF;
      border: 1px dashed #7C3AED;
      border-radius: 6px;
      padding: 20px;
      margin: 24px 0;
      text-align: center;
    }
    .gamification-title {
      font-weight: 700;
      color: #7C3AED;
      margin-bottom: 8px;
      font-size: 16px;
    }
    .badge {
      display: inline-block;
      background-color: #7C3AED;
      color: #FFFFFF;
      padding: 6px 12px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 12px;
      margin-top: 8px;
    }
    .btn-container {
      text-align: center;
      margin-top: 28px;
    }
    .btn-primary {
      display: inline-block;
      background-color: #2563EB;
      color: #FFFFFF;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #64748B;
      border-top: 1px solid #F1F5F9;
      background-color: #F8FAFC;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Approved! Keep it up 🚀</h1>
      </div>
      <div class="content">
        <p style="font-size: 16px; line-height: 24px; margin-top: 0;">Hi ${event.userName},</p>
        <p style="font-size: 15px; color: #334155; line-height: 24px;">Your submission for <strong>${event.exerciseTitle}</strong> has been approved by <strong>${event.adminName}</strong>.</p>
        
        ${event.comment ? `<div class="feedback-box">"${event.comment}"</div>` : ''}

        <div class="gamification-box">
          <div class="gamification-title">🏆 Rewards Earned</div>
          <div style="font-size: 24px; font-weight: 800; color: #1E1B4B; margin: 8px 0;">+${event.xpAwarded} XP</div>
          <div style="color: #4C1D95; font-size: 14px;">Your progress streak is going strong! Keep moving forward.</div>
          ${event.levelUpgraded ? `<div class="badge">Leveled Up to Level ${event.newLevel}! 🎓</div>` : ''}
        </div>
        
        <div class="btn-container">
          <a href="https://rampup.glinteco.com/dashboard" class="btn-primary">View My Portal</a>
        </div>
      </div>
      <div class="footer">
        This is an automated email from RAMP UP Onboarding Portal.
      </div>
    </div>
  </div>
</body>
</html>`;
    } else {
      subject = `[RAMP UP] Changes Requested: ${event.exerciseTitle}`;
      emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Changes Requested</title>
  <style>
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background-color: #F8FAFC;
      color: #0F172A;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      width: 100%;
      padding: 32px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
    }
    .header {
      background-color: #F59E0B;
      color: #FFFFFF;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
    }
    .content {
      padding: 32px 24px;
    }
    .feedback-box {
      background-color: #FFFBEB;
      border-left: 4px solid #F59E0B;
      padding: 16px;
      margin: 20px 0;
      color: #78350F;
      font-size: 14px;
      line-height: 22px;
    }
    .btn-container {
      text-align: center;
      margin-top: 28px;
    }
    .btn-primary {
      display: inline-block;
      background-color: #F59E0B;
      color: #FFFFFF;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #64748B;
      border-top: 1px solid #F1F5F9;
      background-color: #F8FAFC;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Action Required: Update Your PR</h1>
      </div>
      <div class="content">
        <p style="font-size: 16px; line-height: 24px; margin-top: 0;">Hi ${event.userName},</p>
        <p style="font-size: 15px; color: #334155; line-height: 24px;">Your submission for <strong>${event.exerciseTitle}</strong> has been reviewed. <strong>${event.adminName}</strong> requested some changes before this task can be approved.</p>
        
        <div class="feedback-box">
          <strong>Reviewer Feedback:</strong><br>
          "${event.comment || 'No comment provided.'}"
        </div>
        
        <p style="font-size: 14px; color: #475569; line-height: 22px;">Once you have addressed the feedback and pushed the changes to your branch, please update your PR submission link on the portal to re-request a review.</p>

        <div class="btn-container">
          <a href="https://rampup.glinteco.com/exercises/${event.exerciseId}" class="btn-primary">Update Submission</a>
        </div>
      </div>
      <div class="footer">
        This is an automated email from RAMP UP Onboarding Portal.
      </div>
    </div>
  </div>
</body>
</html>`;
    }

    await this.sendEmail(event.userEmail, subject, emailHtml);
  }
}
