import { User } from "@taxi-kassede/core/entities/users";
import dayjs from "dayjs";
import { ApiHandler, useBody } from "sst/node/api";
import { z } from "zod";
import { getUser } from "./utils";
import { Bucket } from "sst/node/bucket";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Template } from "./templates";
import { UserCreateReportResult, getBrowser } from "./user";

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
  const html = Template.Simple(user_, company, dayEntries);
  // Q: What is the viewport size of an A4 paper?
  // A: 595px x 842px
  await page.setContent(html, { waitUntil: ["domcontentloaded", "networkidle0"] });
  await page.setViewport({ width: 595, height: 842 });
  // let screenshot = await page.screenshot({ encoding: "base64" });
  console.log(screenshot);
  await page.emulateMediaType("screen");
  // console.log(html);
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 20, right: 0 },
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
