package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/oliverpool/unipdf/v3/creator"
	"github.com/oliverpool/unipdf/v3/model"
)

type DailyReport struct {
	Date         string  `json:"date"`
	TotalKm      float64 `json:"total_distance"`
	OccupiedKm   float64 `json:"occupied_distance"`
	Tour         int     `json:"tour"`
	DailyRevenue float64 `json:"revenue"`
	Language     string  `json:"language"`
}

type TableHeaders struct {
	Date         string
	TotalKm      string
	OccupiedKm   string
	Tour         string
	DailyRevenue string
}

var translations = map[string]TableHeaders{
	"de-DE": {
		Date:         "Datum",
		TotalKm:      "Gesamt km",
		OccupiedKm:   "Besetzt km",
		Tour:         "Tour",
		DailyRevenue: "Tageskasse",
	},
	"de-CH": {
		Date:         "Datum",
		TotalKm:      "Gesamt km",
		OccupiedKm:   "Besetzt km",
		Tour:         "Tour",
		DailyRevenue: "Tageskasse",
	},
	"en-US": {
		Date:         "Date",
		TotalKm:      "Total km",
		OccupiedKm:   "Occupied km",
		Tour:         "Tour",
		DailyRevenue: "Daily Revenue",
	},
	"en-GB": {
		Date:         "Date",
		TotalKm:      "Total km",
		OccupiedKm:   "Occupied km",
		Tour:         "Tour",
		DailyRevenue: "Daily Revenue",
	},
	"fr-FR": {
		Date:         "Date",
		TotalKm:      "Total km",
		OccupiedKm:   "Km occupé",
		Tour:         "Tour",
		DailyRevenue: "Recette",
	},
}

var dayAbbreviations = map[string]map[int]string{
	"de": {
		1: "Mo", 2: "Di", 3: "Mi", 4: "Do", 5: "Fr", 6: "Sa", 7: "So",
	},
	"en": {
		1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 7: "Sun",
	},
	"fr": {
		1: "Lun", 2: "Mar", 3: "Mer", 4: "Jeu", 5: "Ven", 6: "Sam", 7: "Dim",
	},
}

func formatDate(date string, language string) string {
	t, err := time.Parse("2006-01-02", date)
	if err != nil {
		return date
	}

	weekday := int(t.Weekday())
	if weekday == 0 {
		weekday = 7
	}

	dayAbbr := dayAbbreviations[language][weekday]
	return fmt.Sprintf("%s %02d", dayAbbr, t.Day())
}

func drawFooter(c *creator.Creator, font *model.PdfFont) {
	c.DrawFooter(func(block *creator.Block, args creator.FooterFunctionArgs) {
		p := c.NewStyledParagraph()
		p.SetTextAlignment(creator.TextAlignmentCenter)
		chunk := p.Append(fmt.Sprintf("Page %d of %d", args.PageNum, args.TotalPages))
		chunk.Style.Font = font
		chunk.Style.FontSize = 8
		block.Draw(p)
	})
}

func createTable(c *creator.Creator, font, fontBold *model.PdfFont, reports []DailyReport) error {
	lang := "en"
	if len(reports) > 0 {
		if _, ok := translations[reports[0].Language]; ok {
			lang = reports[0].Language
		}
	}
	headers := translations[lang]

	// Create table
	table := c.NewTable(5)
	table.SetMargins(0, 0, 20, 0)

	// Set column widths
	table.SetColumnWidths([]float64{0.2, 0.2, 0.2, 0.15, 0.25}...)

	headerCells := []string{
		headers.Date,
		headers.TotalKm,
		headers.OccupiedKm,
		headers.Tour,
		headers.DailyRevenue,
	}

	// Create header row
	for _, header := range headerCells {
		cell := table.NewCell()
		cell.SetBackgroundColor(creator.ColorRGBFrom8bit(240, 240, 240))

		p := c.NewStyledParagraph()
		p.SetMargins(2, 2, 2, 2) // Add some space inside cells
		p.SetTextAlignment(creator.TextAlignmentCenter)
		chunk := p.Append(header)
		chunk.Style.Font = fontBold
		chunk.Style.FontSize = 11
		cell.SetContent(p)
	}

	// Add data rows with styling
	for _, report := range reports {
		// Date
		cell := table.NewCell()
		p := c.NewStyledParagraph()
		p.SetMargins(2, 2, 2, 2) // Add some space inside cells
		p.SetTextAlignment(creator.TextAlignmentCenter)
		chunk := p.Append(formatDate(report.Date, lang))
		chunk.Style.Font = font
		chunk.Style.FontSize = 10
		cell.SetContent(p)

		// Total km
		cell = table.NewCell()
		p = c.NewStyledParagraph()
		p.SetMargins(2, 2, 2, 2)
		p.SetTextAlignment(creator.TextAlignmentRight)
		chunk = p.Append(fmt.Sprintf("%.1f", report.TotalKm))
		chunk.Style.Font = font
		chunk.Style.FontSize = 10
		cell.SetContent(p)

		// Occupied km
		cell = table.NewCell()
		p = c.NewStyledParagraph()
		p.SetMargins(2, 2, 2, 2)
		p.SetTextAlignment(creator.TextAlignmentRight)
		chunk = p.Append(fmt.Sprintf("%.1f", report.OccupiedKm))
		chunk.Style.Font = font
		chunk.Style.FontSize = 10
		cell.SetContent(p)

		// Tour
		cell = table.NewCell()
		p = c.NewStyledParagraph()
		p.SetMargins(2, 2, 2, 2)
		p.SetTextAlignment(creator.TextAlignmentCenter)
		chunk = p.Append(fmt.Sprintf("%d", report.Tour))
		chunk.Style.Font = font
		chunk.Style.FontSize = 10
		cell.SetContent(p)

		// Daily Revenue
		cell = table.NewCell()
		p = c.NewStyledParagraph()
		p.SetMargins(2, 2, 2, 2)
		p.SetTextAlignment(creator.TextAlignmentRight)
		chunk = p.Append(fmt.Sprintf("%.2f", report.DailyRevenue))
		chunk.Style.Font = font
		chunk.Style.FontSize = 10
		cell.SetContent(p)
	}

	return c.Draw(table)
}

func Handler(request events.APIGatewayV2HTTPRequest) (events.APIGatewayProxyResponse, error) {
	var reports []DailyReport
	err := json.Unmarshal([]byte(request.Body), &reports)
	if err != nil {
		return events.APIGatewayProxyResponse{StatusCode: 400, Body: "Invalid JSON input"}, nil
	}

	font, err := model.NewStandard14Font("Helvetica")
	if err != nil {
		return events.APIGatewayProxyResponse{StatusCode: 500}, err
	}

	fontBold, err := model.NewStandard14Font("Helvetica-Bold")
	if err != nil {
		return events.APIGatewayProxyResponse{StatusCode: 500}, err
	}

	c := creator.New()
	c.SetPageMargins(50, 50, 50, 50)

	drawFooter(c, font)

	if err := createTable(c, font, fontBold, reports); err != nil {
		return events.APIGatewayProxyResponse{StatusCode: 500}, err
	}

	var buf bytes.Buffer
	if err := c.Write(&buf); err != nil {
		return events.APIGatewayProxyResponse{StatusCode: 500}, err
	}

	pdfBase64 := base64.StdEncoding.EncodeToString(buf.Bytes())

	return events.APIGatewayProxyResponse{
		Headers: map[string]string{
			"Content-Type":        "application/pdf",
			"Content-Disposition": "attachment; filename=taxi_report.pdf",
		},
		Body:            pdfBase64,
		StatusCode:      200,
		IsBase64Encoded: true,
	}, nil
}

func main() {
	lambda.Start(Handler)
}
