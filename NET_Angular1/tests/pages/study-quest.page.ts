import { Locator, Page } from '@playwright/test';
import { ApiAddresses } from '../api/api-addresses';

export class StudyQuestPage {
  public readonly profileName: Locator;
  public readonly xpPill: Locator;
  public readonly levelPill: Locator;
  public readonly rankPill: Locator;
  public readonly statsSection: Locator;
  public readonly streakValue: Locator;
  public readonly puzzleSection: Locator;
  public readonly puzzleQuestion: Locator;
  public readonly puzzleOptions: Locator;
  public readonly puzzleResult: Locator;
  public readonly medalsSection: Locator;
  public readonly medalBadges: Locator;
  public readonly conquestButton: Locator;
  public readonly loadingState: Locator;
  public readonly errorState: Locator;

  public constructor(private readonly page: Page) {
    this.profileName = page.locator('.profile-name');
    this.xpPill = page.locator('.xp-pill');
    this.levelPill = page.locator('.meta-pill', {
      has: page.locator('.material-symbols-rounded', { hasText: 'military_tech' }),
    });
    this.rankPill = page.locator('.meta-pill', {
      has: page.locator('.material-symbols-rounded', { hasText: 'workspace_premium' }),
    });
    this.statsSection = page.locator('.stats-section');
    this.streakValue = page.locator('.stat-card').filter({ hasText: 'Streak' }).locator('.stat-value');
    this.puzzleSection = page.locator('.puzzle-section');
    this.puzzleQuestion = page.locator('.puzzle-question');
    this.puzzleOptions = page.locator('.puzzle-option');
    this.puzzleResult = page.locator('.puzzle-result');
    this.medalsSection = page.locator('.medals-section');
    this.medalBadges = page.locator('.medal-badge');
    this.conquestButton = page.locator('.sq-actions .primary-button');
    this.loadingState = page.locator('.loading-state');
    this.errorState = page.locator('.error-state');
  }

  public async goto(courseId: number): Promise<void> {
    await this.page.goto(
      `${ApiAddresses.baseUrl}${ApiAddresses.studyQuest}?courseId=${courseId}`,
    );
  }

  public getPuzzleOptionByIndex(index: number): Locator {
    return this.puzzleOptions.nth(index);
  }
}
