# IGNOU Assignment Status and Grade Card: Endpoint Reference

Two public IGNOU web pages return a student's assignment/practical status and grade card status. Neither is a JSON API. Both return **HTML**, so the data must be read out of the page markup. No login is needed. Use placeholders below: enrolment `2000000001`, programme `BCA_NEW`.

---

## 1. Assignment / Practical Status

| | |
|---|---|
| URL | `https://isms.ignou.ac.in/changeadmdata/StatusAssignment.ASP` |
| Method | `POST` |
| Content-Type | `application/x-www-form-urlencoded` |
| Response | HTML (classic ASP) |

### Request

| Form field | Example | Notes |
|---|---|---|
| `EnrNo` | `2000000001` | 9 to 10 alphanumeric characters (IGNOU's own validation) |
| `program` | `BCA_NEW` | Programme code exactly as IGNOU lists it (e.g. `BCA_NEW`, `MCA_NEW`, `BAG`) |
| `Submit` | `Submit` | Fixed value |

```
POST /changeadmdata/StatusAssignment.ASP HTTP/1.1
Host: isms.ignou.ac.in
Content-Type: application/x-www-form-urlencoded
Referer: https://isms.ignou.ac.in/changeadmdata/StatusAssignment.ASP
Origin: https://isms.ignou.ac.in
User-Agent: <a normal browser user agent>

EnrNo=2000000001&program=BCA_NEW&Submit=Submit
```

### Response when a record exists

The HTML is malformed (unclosed `<div>`/`<font>` tags, unquoted attributes, missing `</body>`), so use a forgiving HTML parser, not an XML parser or regex over the whole page.

```html
<font class=cfont><div align=right><font size=1>Status as on 15-Oct-2026 12:24:10 PM</font></div></font>
<div align=center><table ...><tr class=td2><td ...><div align=center><table class=bkctable>
<tr class=tdheader><td colspan=5>Assignment/Practical/Project Marks/Awards Transmission Status* ...</td></tr>
<tr class=td2><td colspan=5><div align=center><font size=+1>Enrollment No.: 2000000001 | Program: BCA_NEW </td></tr>
<tr class=td1><td><b>Name</td><td><b>Course</td><td><b>Session</td><td><b>Status</td><td><b><div align=center>Date</td></tr>
<tr class=td2><td>Assignment</td><td>BCS012</td><td>Dec-2024</td><td>Check Grade Card Status for detail.</td><td><div align=center>13-May-2025</td></tr>
<tr class=td1><td>Assignment</td><td>BCS41</td><td>Jun-2026</td><td>Received and in-process at Headquarter for updation.</td><td><div align=center>7-Oct-2026</td></tr>
<tr class=td2><td>Practical</td><td>BCSL135</td><td>Dec-2025</td><td>Check Grade Card Status for detail.</td><td><div align=center>4-Aug-2026</td></tr>
</table></table>
```

**How to extract rows:** take every `<tr>` that has exactly **5 `<td>` children**, and skip the header row (first cell text is `Name`).

| Cell | Meaning | Example |
|---|---|---|
| 1 | Type of submission (labelled "Name" in the header) | `Assignment`, `Practical`, `Project` |
| 2 | Course code | `BCS012` |
| 3 | Session | `Dec-2024`, `Jun-2026` |
| 4 | Status text | see table below |
| 5 | Date | `13-May-2025` |

**Status texts seen:**

| Text | Meaning |
|---|---|
| `Check Grade Card Status for detail.` | Marks received and recorded. The marks themselves are on the grade card. |
| `Received and in-process at Headquarter for updation.` | Reached headquarters, not yet updated. |

Other texts are possible; treat unknown text as "other" and show it as is.

**Data quirks:**
- Course codes are not zero-padded consistently (`BCS41` here, `BCS041` on the grade card). Do not assume codes match across the two pages without normalising.
- Dates are `D-Mon-YYYY` with no zero padding on the day (`7-Oct-2026`), English month abbreviations.
- The enrolment number and programme are echoed in the line `Enrollment No.: ... | Program: ...`. Programme can be read with `Program:\s*(\S+)`.
- Whitespace and line breaks may appear inside cell text; normalise whitespace.

### Response when no record exists

A short page with no table:

```html
<p><font class=c2font>Enrollment No.2000000002 and Program BCA_NEW
Assignment/Project/Practical Submission Status Not found.<br>Kindly check with the concerned
Study Centre/Regional Centre, if submitted.<a href=javascript:window.close()>Close</a>
```

Detect with the phrase `Submission Status Not found`. This is the same for a wrong enrolment number, a wrong programme, or nothing submitted yet. The page does not say which.

---

## 2. Grade Card Status

| | |
|---|---|
| URL | `https://gradecard.ignou.ac.in/view_gradecard.aspx?eno={enrolment}&prog={programme}&type={type}` |
| Method | `GET` |
| Response | HTML (ASP.NET WebForms) |

### Request

| Query parameter | Example | Notes |
|---|---|---|
| `eno` | `2000000001` | Enrolment number |
| `prog` | `BCA_NEW` | Programme code (URL-encode it) |
| `type` | `1` | Integer 1 to 4: which grade card layout the programme uses |

```
GET /view_gradecard.aspx?eno=2000000001&prog=BCA_NEW&type=1 HTTP/1.1
Host: gradecard.ignou.ac.in
```

**The `type` is not known to students.** A wrong type returns the same "empty" page as a wrong enrolment number. To find the right one, request `type=1`, then `2`, `3`, `4` and stop at the first response that contains the course table. Remember the working type per programme so later requests need only one call.

### Response when a record exists

A full page with an ASP.NET form (hidden `__VIEWSTATE`, `__EVENTVALIDATION` fields, a Logout button, logos) around the data. The useful elements are identified by these ids:

| Data | Selector | Example value |
|---|---|---|
| Container (confirms this is a grade card page) | `#ctl00_ContentPlaceHolder1_RegistrationPreview` | |
| Status date | `span#ctl00_ContentPlaceHolder1_lblgcasondt` | `14-10-2026` (DD-MM-YYYY) |
| Enrolment number | `span#ctl00_ContentPlaceHolder1_lblDispEnrolno` | `2000000001` |
| Student name | `span#ctl00_ContentPlaceHolder1_lblDispname` | |
| Programme code | `span#ctl00_ContentPlaceHolder1_lblDispProgCode` | `BCA_NEW` |
| Course table | `table#ctl00_ContentPlaceHolder1_gvDetail` | |

Course table:

```html
<table id="ctl00_ContentPlaceHolder1_gvDetail" cellspacing="0" cellpadding="8" border="0">
  <tr><th scope="col">COURSE</th><th scope="col">Asgn1</th><th scope="col">LAB1</th><th scope="col">LAB2</th>
      <th scope="col">LAB3</th><th scope="col">LAB4</th><th scope="col">TERM END THEORY</th><th scope="col">STATUS</th></tr>
  <tr><td>BCS012</td><td>63</td><td>-</td><td>-</td><td>-</td><td>-</td><td>60</td><td>COMPLETED</td></tr>
  <tr><td>BCS040</td><td>67</td><td>-</td><td>-</td><td>-</td><td>-</td><td>16</td><td>NOT
      COMPLETED</td></tr>
  <tr><td>BCSL013</td><td>76</td><td>79</td><td>-</td><td>-</td><td>-</td><td>-</td><td>COMPLETED</td></tr>
  <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
</table>
```

**Parsing rules:**
- Read column names from the `<th>` header row and map cells by position. The columns can differ by programme (the page itself notes that "Assignment 4 and TE Practical do not apply to all the courses"), so do not hard-code the column list.
- Header labels seen: `COURSE`, `Asgn1`, `LAB1` to `LAB4`, `TERM END THEORY`, `STATUS`. Other labels (e.g. further assignments, a term-end practical column) may appear.
- `-` means "no marks recorded yet". It does not mean zero.
- Marks are integers as text.
- `STATUS` values seen: `COMPLETED`, `NOT COMPLETED`. The text can contain a line break (`NOT\n COMPLETED`), so normalise whitespace first, and test for `NOT COMPLETED` before `COMPLETED` (the second is a substring of the first).
- The final row has only `&nbsp;` cells. Ignore rows whose first cell is empty.
- The student name span can be empty even when the table exists; do not use the name as the test for a valid result.
- A course is typically below the pass mark if `TERM END THEORY` is under 35.
- The page states the result is "indicative only" and has no legal validity.

### Response when no record exists (or wrong type)

The page still loads and still contains `#ctl00_ContentPlaceHolder1_RegistrationPreview`, but the data spans are empty and the course table does not exist:

```html
<div id="ctl00_ContentPlaceHolder1_RegistrationPreview" style="display: block">
  <span id="ctl00_ContentPlaceHolder1_lblgcasondt">14-10-2026</span>
  <span id="ctl00_ContentPlaceHolder1_lblDispEnrolno"></span>
  <span id="ctl00_ContentPlaceHolder1_lblDispname"></span>
  <span id="ctl00_ContentPlaceHolder1_lblDispProgCode"></span>
  <div></div>
</div>
```

**Rule:** a result is valid only if `#ctl00_ContentPlaceHolder1_gvDetail` exists **and** has at least one data row. If the container exists but the table is missing or empty, it is "no record for this type". Only after all four types fail should it be reported as "no record found".

---

## 3. Programme codes

`program` / `prog` must be IGNOU's own programme code (examples: `BCA_NEW`, `MCA_NEW`, `BAG`). The full list is the `<select>` dropdown on the assignment status page (`GET https://isms.ignou.ac.in/changeadmdata/StatusAssignment.ASP`); each `<option value>` is the code and the option text is the name. The select's `name`/`id` has not been confirmed, so locate it by finding the `<select>` with many options.

---

## 4. Suggested normalised output

Not part of IGNOU's response; a convenient shape for the parsed data.

**Assignment status**
```json
{
  "programmeCode": "BCA_NEW",
  "rows": [
    { "kind": "Assignment", "course": "BCS012", "session": "Dec-2024",
      "statusText": "Check Grade Card Status for detail.",
      "category": "evaluated", "date": "13-May-2025", "dateIso": "2025-05-13" }
  ]
}
```
`category`: `evaluated` for "Check Grade Card Status...", `in_process` for "Received and in-process...", otherwise `other`.

**Grade card**
```json
{
  "studentName": "",
  "programmeCode": "BCA_NEW",
  "asOn": "14-10-2026",
  "courses": [
    { "code": "BCS040",
      "components": [ { "label": "Asgn1", "raw": "67", "value": 67 }, { "label": "LAB1", "raw": "-", "value": null },
                      { "label": "TERM END THEORY", "raw": "16", "value": 16 } ],
      "status": "not_completed" }
  ]
}
```
`status`: `completed` | `not_completed` | `unknown`.

---

## 5. Operational notes

- Allow 20 to 30 seconds per request. IGNOU's servers are sometimes slow; retry timeouts, network errors, 5xx and 429 a couple of times with a short back-off. Do not retry 4xx.
- Send a normal browser `User-Agent` and (for the POST) `Referer`/`Origin` as shown above.
- Responses are HTML, decode as UTF-8.
- If a page matches none of the cases above (no container, no table, no "Not found" phrase), treat it as an unexpected page (site change or error page), not as "no record".

## 6. Not confirmed

- Grade card `type` 2, 3 and 4 markup. Only `type=1` was seen; assume the same table markup.
- Whether a plain GET to the grade card page always works without the ASP.NET form fields, and whether IGNOU blocks some hosting providers' IP ranges. Test from the real deployment environment.
- The exact `name`/`id` of the programme dropdown.
- Response character encoding (UTF-8 assumed).
