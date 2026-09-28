import { expect, Page, Response } from '@playwright/test';
import { ApiAddresses } from './api-addresses';

export class ApiFlow {
  public constructor(private readonly page: Page) { }

  public async waitForLoginResponse(): Promise<Response> {
    return await this.page.waitForResponse(
      response =>
        response.url().includes(ApiAddresses.apiLogin) &&
        response.request().method() === 'POST'
    );
  }

  public async verifySuccessfulLogin(responsePromise: Promise<Response>): Promise<string> {
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    const body = await response.json();
    const token = body.accessToken || body.token;

    expect(token).toBeDefined();
    return token;
  }

  public async verifyFailedLogin(
    responsePromise: Promise<Response>,
    expectedStatuses: number[] = [400, 401]
  ): Promise<void> {
    expect(expectedStatuses).toContain((await responsePromise).status());
  }

  public async waitForForgotPasswordResponse(): Promise<Response> {
    return await this.page.waitForResponse(
      response =>
        response.url().includes(ApiAddresses.apiForgotPassword) &&
        response.request().method() === 'POST'
    );
  }

  public async verifySuccessfulForgotPassword(
    responsePromise: Promise<Response>,
    expectedEmail: string,
    expectedMessage: string
  ): Promise<void> {
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(response.request().postDataJSON().email).toBe(expectedEmail);
    expect((await response.json()).message).toBe(expectedMessage);
  }

  public async waitForChangePasswordResponse(): Promise<Response> {
    return await this.page.waitForResponse(
      response =>
        response.url().includes(ApiAddresses.apiChangePassword) &&
        response.request().method() === 'POST'
    );
  }

  public async verifySuccessfulChange(responsePromise: Promise<Response>): Promise<void> {
    expect((await responsePromise).status()).toBe(200);
  }

  public async verifyRejectedChange(
    responsePromise: Promise<Response>,
    expectedStatuses: number[] = [400]
  ): Promise<void> {
    expect(expectedStatuses).toContain((await responsePromise).status());
  }

  public async waitForCompleteLessonResponse(): Promise<Response> {
    return await this.page.waitForResponse(
      response =>
        /\/api\/courses\/\d+\/units\/\d+\/lessons\/\d+\/complete/.test(response.url()) &&
        response.request().method() === 'PATCH'
    );
  }

  public async verifySuccessfulLessonCompletion(responsePromise: Promise<Response>): Promise<void> {
    const response = await responsePromise;
    expect(response.status()).toBe(200);
  }

  public async waitForCreateCourseResponse(): Promise<Response> {
    return this.page.waitForResponse(
      res =>
        res.url().includes(ApiAddresses.apiCourses) &&
        res.request().method() === 'POST'
    );
  }

  public async verifySuccessfulCourseCreation(
    responsePromise: Promise<Response>
  ): Promise<number> {
    const response = await responsePromise;
    expect(response.status()).toBe(201);
    const body = await response.json() as { id: number };
    expect(body.id).toBeDefined();
    return body.id;
  }

  public async deleteCourse(courseId: number): Promise<void> {
    if (this.page.url() === 'about:blank') {
      await this.page.goto(ApiAddresses.baseUrl);
    }
    const accessToken = await this.page.evaluate(() =>
      localStorage.getItem('accessToken')
    );
    expect(accessToken).not.toBeNull();
    const response = await this.page.request.delete(
      `${ApiAddresses.apiBaseUrl}${ApiAddresses.apiCourses}/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    expect(response.status()).toBe(204);
  }

  public async waitForCreateTestResponse(): Promise<Response> {
    return this.page.waitForResponse(
      res =>
        res.url().includes(ApiAddresses.apiTests) &&
        res.request().method() === 'POST'
    );
  }

  public async verifySuccessfulTestCreation(
    responsePromise: Promise<Response>
  ): Promise<number> {
    const response = await responsePromise;
    expect(response.status()).toBe(201);
    const body = await response.json() as { id: number };
    expect(body.id).toBeDefined();
    return body.id;
  } 

  public async deleteTest(testId: number): Promise<void> {
    if (this.page.url() === 'about:blank') {
      await this.page.goto(ApiAddresses.baseUrl);
    }
    const accessToken = await this.page.evaluate(() =>
      localStorage.getItem('accessToken')
    );
    expect(accessToken).not.toBeNull();
    const response = await this.page.request.delete(
      `${ApiAddresses.apiBaseUrl}${ApiAddresses.apiTests}/${testId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    expect(response.status()).toBe(204);
  }
  
  public async waitForEnrollResponse(courseId: number): Promise<Response> {
    return this.page.waitForResponse(
      r =>
        r.url().includes(`/api/courses/${courseId}/enroll`) &&
        r.request().method() === 'POST'
    );
  }

  public async verifySuccessfulEnrollment(responsePromise: Promise<Response>): Promise<void> {
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const body = await response.json() as { courseId: number };
    expect(body.courseId).toBeDefined();
  }

  public waitForProgressResponse(courseId: number): Promise<Response> {
    return this.page.waitForResponse(
      r =>
        r.url().includes(`/api/courses/${courseId}/progress`) &&
        r.request().method() === 'GET'
    );
  }

  public async apiEnrollInCourse(courseId: number): Promise<void> {
    if (this.page.url() === 'about:blank') {
      await this.page.goto(ApiAddresses.baseUrl);
    }
    const accessToken = await this.page.evaluate(() =>
      localStorage.getItem('accessToken')
    );
    expect(accessToken).not.toBeNull();
    await this.page.request.post(
      `${ApiAddresses.apiBaseUrl}/api/courses/${courseId}/enroll`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
