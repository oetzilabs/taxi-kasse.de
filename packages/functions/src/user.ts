import { User } from "@taxi-kassede/core/entities/users";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { ApiHandler, useBody, useQueryParams } from "sst/node/api";
import { z } from "zod";
import { getUser } from "./utils";
import puppeteerCore, { type Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer";
import { Bucket } from "sst/node/bucket";
import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Template } from "./templates";
import { Style } from "./templates/style";
import * as uuid from "uuid";

dayjs.extend(advancedFormat);

export const create = ApiHandler(async (_evt) => {
  const u = await User.create({ name: "test", email: "oezguerisbert@gmail.com" }, {});

  return {
    statusCode: 200,
    body: JSON.stringify({ user: u }, null, 2),
  };
});

export const statistics = ApiHandler(async (x) => {
  const user = await getUser(x);
  const params = useQueryParams();
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: user.message,
        statistics: [],
      }),
      statusCode: 200,
    };
  }
  if (!user || !user.id) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No user found",
        statistics: [],
      }),
      statusCode: 200,
    };
  }
  const user_ = await User.findById(user.id);
  if (!user_) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No user found",
        statistics: [],
      }),
      statusCode: 200,
    };
  }
  if (!user_.companyId) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No company found",
        statistics: [],
      }),
      statusCode: 200,
    };
  }
  const statistics = await User.statistics(user_.companyId, {
    from: dayjs(params.from).toDate(),
    to: dayjs(params.to).toDate(),
  });
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ statistics }),
    statusCode: 200,
  };
});

export const hasCompany = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: user.message,
        hasCompany: false,
      }),
      statusCode: 200,
    };
  }
  if (!user || !user.id) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No user found",
        hasCompany: false,
      }),
      statusCode: 200,
    };
  }
  const user_ = await User.findById(user.id);
  if (!user_) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No user found",
        hasCompany: false,
      }),
      statusCode: 200,
    };
  }
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ success: true, hasCompany: !!user_.companyId }),
    statusCode: 200,
  };
});

export const company = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: user.message,
        company: null,
      }),
      statusCode: 200,
    };
  }
  if (!user || !user.id) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No user found",
        company: null,
      }),
      statusCode: 200,
    };
  }
  const user_ = await User.findById(user.id);
  if (!user_) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No user found",
        company: null,
      }),
      statusCode: 200,
    };
  }
  if (!user_.companyId) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No company found",
        company: null,
      }),
      statusCode: 200,
    };
  }

  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ error: null, company: user.company }),
    statusCode: 200,
  };
});

export const listAll = ApiHandler(async (x) => {
  const users = await User.all();
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ success: true, users }),
    statusCode: 200,
  };
});

export type CalendarResult = {
  error: string | null;
  calendar: Awaited<ReturnType<typeof User.calendar>> | null;
};

export const calendar = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: user.message,
        calendar: null,
      } as CalendarResult),
      statusCode: 200,
    };
  }
  if (!user || !user.id) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No user found",
        calendar: null,
      } as CalendarResult),
      statusCode: 200,
    };
  }

  const user_ = await User.findById(user.id);
  if (!user_) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "No user found",
        calendar: null,
      } as CalendarResult),
      statusCode: 200,
    };
  }
  if (!user_.companyId) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "User has no company",
        calendar: null,
      } as CalendarResult),
      statusCode: 200,
    };
  }
  const dateRange = useQueryParams();
  const from = dayjs(dateRange.from).toDate();
  const to = dayjs(dateRange.to).toDate();
  const calendar = await User.calendar(user_.id, user_.companyId, { from, to });

  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ error: null, calendar } as CalendarResult),
    statusCode: 200,
  };
});

export type CreateDayEntryResult =
  | {
      success: true;
      error: null;
      entry: NonNullable<Awaited<ReturnType<typeof User.createDayEntry>>>;
    }
  | {
      success: false;
      error: string;
      entry: null;
    };

export const createDayEntry = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: user.message,
        entry: null,
      } as CreateDayEntryResult),
      statusCode: 200,
    };
  }
  if (!user || !user.id) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No user found",
        entry: null,
      } as CreateDayEntryResult),
      statusCode: 200,
    };
  }

  const user_ = await User.findById(user.id);
  if (!user_) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No user found",
        entry: null,
      } as CreateDayEntryResult),
      statusCode: 200,
    };
  }
  const body = useBody();
  if (!body) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No body found",
        entry: null,
      } as CreateDayEntryResult),
      statusCode: 200,
    };
  }
  const data = JSON.parse(body);
  const date = dayjs(data.date).toDate();
  const e: Awaited<ReturnType<typeof User.createDayEntry>> | Error = await User.createDayEntry(user_.id, {
    date,
    total_distance: data.total_distance,
    driven_distance: data.driven_distance,
    tour_count: data.tour_count,
    cash: data.cash,
  }).catch((e) => {
    return e;
  });
  if (e instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: e.message,
        entry: null,
      } as CreateDayEntryResult),
      statusCode: 422,
    };
  }
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      success: true,
      error: null,
      entry: e,
    } as CreateDayEntryResult),
    statusCode: 200,
  };
});

export type UpdateDayEntryResult =
  | {
      success: true;
      error: null;
      entry: NonNullable<Awaited<ReturnType<typeof User.updateDayEntry>>>;
      changes: Partial<NonNullable<Awaited<ReturnType<typeof User.updateDayEntry>>>>;
    }
  | {
      success: false;
      error: string;
      entry: null;
      changes: null;
    };

export const updateDayEntry = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: user.message,
        entry: null,
      } as UpdateDayEntryResult),
      statusCode: 200,
    };
  }
  if (!user || !user.id) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No user found",
        entry: null,
      } as UpdateDayEntryResult),
      statusCode: 200,
    };
  }

  const user_ = await User.findById(user.id);
  if (!user_) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No user found",
        entry: null,
      } as UpdateDayEntryResult),
      statusCode: 200,
    };
  }
  const body = useBody();
  if (!body) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No body found",
        entry: null,
      } as UpdateDayEntryResult),
      statusCode: 200,
    };
  }
  const data = JSON.parse(body);
  const oldEntry = await User.dayEntry(user_.id, { id: data.id });
  if (!oldEntry) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: `No entry found with id ${data.id}`,
        entry: null,
      } as UpdateDayEntryResult),
      statusCode: 200,
    };
  }
  const e: Awaited<ReturnType<typeof User.updateDayEntry>> | Error = await User.updateDayEntry(user_.id, {
    id: data.id,
    total_distance: data.total_distance,
    driven_distance: data.driven_distance,
    tour_count: data.tour_count,
    cash: data.cash,
  }).catch((e) => {
    return e;
  });
  if (e instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: e.message,
        entry: null,
      } as UpdateDayEntryResult),
      statusCode: 422,
    };
  }

  let changes = {} as Partial<NonNullable<Awaited<ReturnType<typeof User.updateDayEntry>>>>;

  Object.keys(data).forEach((key) => {
    let k = key as keyof NonNullable<Awaited<ReturnType<typeof User.updateDayEntry>>>;
    if (data[k] !== oldEntry[k]) {
      changes[k] = data[k];
    }
  });

  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      success: true,
      error: null,
      entry: e,
      changes: changes,
    } as UpdateDayEntryResult),
    statusCode: 200,
  };
});

export type DeleteDayEntryResult =
  | {
      success: true;
      error: null;
      entry: NonNullable<Awaited<ReturnType<typeof User.updateDayEntry>>>;
    }
  | {
      success: false;
      error: string;
      entry: null;
    };

export const deleteDayEntry = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: user.message,
        entry: null,
      } as DeleteDayEntryResult),
      statusCode: 200,
    };
  }
  if (!user || !user.id) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No user found",
        entry: null,
      } as DeleteDayEntryResult),
      statusCode: 200,
    };
  }

  const user_ = await User.findById(user.id);
  if (!user_) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No user found",
        entry: null,
      } as DeleteDayEntryResult),
      statusCode: 200,
    };
  }
  const body = useBody();
  if (!body) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No body found",
        entry: null,
      } as DeleteDayEntryResult),
      statusCode: 200,
    };
  }
  const data = JSON.parse(body);
  const e: Awaited<ReturnType<typeof User.deleteDayEntry>> | Error = await User.deleteDayEntry(user_.id, {
    id: data.id,
  }).catch((e) => {
    return e;
  });
  if (e instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: e.message,
        entry: null,
      } as DeleteDayEntryResult),
      statusCode: 422,
    };
  }
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      success: true,
      error: null,
      entry: e,
    } as DeleteDayEntryResult),
    statusCode: 200,
  };
});

async function getBrowser(): Promise<Browser> {
  if (process.env.IS_LOCAL) {
    return puppeteer.launch({
      headless: "new",
      ignoreHTTPSErrors: true,
      args: ["--no-sandbox"],
      executablePath: "/home/oezguer/browser/chromium-browser/chromium/linux-1206789/chrome-linux/chrome",
    }) as unknown as Browser;
  }
  chromium.setGraphicsMode = false;

  const browser = await puppeteerCore.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
  return browser;
}

export type UserCreateReportResult =
  | {
      success: false;
      error: string;
      report: null;
    }
  | {
      success: true;
      error: null;
      report: {
        name: string;
        url: string;
      };
    };

export const createReport = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: user.message,
        report: null,
      } as UserCreateReportResult),
      statusCode: 200,
    };
  }
  if (!user || !user.id) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No user found",
        report: null,
      } as UserCreateReportResult),
      statusCode: 200,
    };
  }

  const user_ = await User.findById(user.id);
  if (!user_) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No user found",
        report: null,
      } as UserCreateReportResult),
      statusCode: 200,
    };
  }
  if (!user_.companyId) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "User has no company",
        report: null,
      } as UserCreateReportResult),
      statusCode: 200,
    };
  }
  const company = user_.company!;
  const body = useBody();
  if (!body) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No body found",
        report: null,
      } as UserCreateReportResult),
      statusCode: 200,
    };
  }
  const date_range = JSON.parse(body).date_range;
  const dateRangeZod = z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .or(z.enum(["month", "year", "all"]));
  const dateRange = dateRangeZod.parse(date_range);

  if (!dateRange) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "Invalid date range",
        report: null,
      } as UserCreateReportResult),
      statusCode: 200,
    };
  }

  const dayEntries = await User.getDayEntriesByRange(user_.id, dateRange);
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true);
  // generate random report number
  const reportnumber = uuid.v4();
  const html = Template.Simple(reportnumber, user_, company, dayEntries, 1);
  await page.setViewport({ width: 595, height: 842, deviceScaleFactor: 0.5 });
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
  await page.setContent(html, { waitUntil: ["load", "domcontentloaded", "networkidle0"] });
  page.on("requestfailed", (request) => {
    console.error(`Failed to load resource: ${request.url()} (${request.failure()?.errorText ?? "unknown error"})`);
  });
  await page.emulateMediaType("screen");
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });
  await page.close();
  await browser.close();
  // upload to s3 bucket
  const s3client = new S3Client({
    region: "eu-central-1",
  });
  const url = `reports/${user_.id}/${dayjs().format("YYYY-MM-DD")}.pdf`;
  const command = new PutObjectCommand({
    Bucket: Bucket["taxikassede-bucket"].bucketName,
    Key: url,
    Body: pdf,
  });
  await s3client.send(command);

  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      success: true,
      error: null,
      report: {
        name: `${user_.name}-${dayjs().format("YYYY-MM-DD")}.pdf`,
        url: url,
      },
    } as UserCreateReportResult),
    statusCode: 200,
  };
});

export type UserGetReportsListResult =
  | {
      success: true;
      error: null;
      reports: { name: string; key: string }[];
    }
  | {
      success: false;
      error: string;
      reports: null;
    };

const getFileName = (url: string) => {
  const parts = url.split("/");
  return parts[parts.length - 1];
};

export const listReports = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: user.message,
        reports: null,
      } as UserGetReportsListResult),
      statusCode: 200,
    };
  }
  if (!user || !user.id) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No user found",
        reports: null,
      } as UserGetReportsListResult),
      statusCode: 200,
    };
  }

  const user_ = await User.findById(user.id);
  if (!user_) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "No user found",
        reports: null,
      } as UserGetReportsListResult),
      statusCode: 200,
    };
  }
  if (!user_.companyId) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "User has no company",
        reports: null,
      } as UserGetReportsListResult),
      statusCode: 200,
    };
  }
  const s3client = new S3Client({
    region: "eu-central-1",
  });

  const command = new ListObjectsV2Command({
    Bucket: Bucket["taxikassede-bucket"].bucketName,
    Prefix: `reports/${user_.id}/`,
  });

  const result = await s3client.send(command);

  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      success: true,
      error: null,
      reports:
        (result.Contents ?? ([] as NonNullable<(typeof result)["Contents"]>))
          .filter((c) => typeof c.Key === "string" && c.Key.endsWith(".pdf"))
          .map((x) => ({
            name: getFileName(x.Key ?? ""),
            key: x.Key!,
          })) ?? ([] as string[]),
    } as UserGetReportsListResult),
    statusCode: 200,
  };
});

export type UserDownloadFileSignedUrl =
  | {
      success: true;
      error: null;
      url: string;
    }
  | {
      success: false;
      error: string;
      url: null;
    };

export const downloadFileSignedUrl = ApiHandler(async (x) => {
  const user = await getUser(x);
  if (user instanceof Error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ success: false, error: user.message, url: null } as UserDownloadFileSignedUrl),
      statusCode: 200,
    };
  }
  if (!user || !user.id) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ success: false, error: "No user found", url: null } as UserDownloadFileSignedUrl),
      statusCode: 200,
    };
  }

  const user_ = await User.findById(user.id);
  if (!user_) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ success: false, error: "No user found", url: null } as UserDownloadFileSignedUrl),
      statusCode: 200,
    };
  }
  if (!user_.companyId) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ success: false, error: "User has no company", url: null } as UserDownloadFileSignedUrl),
      statusCode: 200,
    };
  }
  const body = useBody();
  if (!body) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ success: false, error: "No body found", url: null } as UserDownloadFileSignedUrl),
      statusCode: 200,
    };
  }
  const data = JSON.parse(body);
  const key = data.key;
  const s3client = new S3Client({
    region: "eu-central-1",
  });

  const command = new GetObjectCommand({
    Bucket: Bucket["taxikassede-bucket"].bucketName,
    Key: key,
  });

  const url = await getSignedUrl(s3client, command);

  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ success: true, error: null, url } as UserDownloadFileSignedUrl),
    statusCode: 200,
  };
});
