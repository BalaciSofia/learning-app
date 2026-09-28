import { Locator, Page } from '@playwright/test';
import { ApiAddresses } from '../api/api-addresses';

export class BattlesPage {
  private readonly page: Page;
  private readonly challengeButton: Locator;
  private readonly invitations: Locator;
  private readonly activeDuels: Locator;
  private readonly historyItems: Locator;
  private readonly emptyStates: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.challengeButton = page.locator('button', { hasText: '+ Challenge a Student' });
    this.invitations = page.locator('section:has-text("Incoming Invitations") .invitation-card');
    this.activeDuels = page.locator('section:has-text("Active Duels") .invitation-card');
    this.historyItems = page.locator('.history-list .history-card');
    this.emptyStates = page.locator('.empty-state');
  }

  public async goto(): Promise<void> {
    await this.page.goto(ApiAddresses.baseUrl + ApiAddresses.battles);
  }

  public getChallengeButton(): Locator {
    return this.challengeButton;
  }

  public getInvitations(): Locator {
    return this.invitations;
  }

  public getActiveDuels(): Locator {
    return this.activeDuels;
  }

  public getHistoryItems(): Locator {
    return this.historyItems;
  }

  public getEmptyStates(): Locator {
    return this.emptyStates;
  }

  public getAcceptButton(index: number = 0): Locator {
    return this.invitations.nth(index).locator('button.btn-accept');
  }

  public getRejectButton(index: number = 0): Locator {
    return this.invitations.nth(index).locator('button.btn-reject');
  }

  public getPlayButton(index: number = 0): Locator {
    return this.activeDuels.nth(index).locator('button.btn-play');
  }
}
