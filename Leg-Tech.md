<!-- INDEX -->
## Table of Contents

- [Project Ideas To Do](#project-ideas-to-do)
  - [Inflation Calculator](#inflation-calculator)
  - [Unified Hearing & Markup Data](#unified-hearing-markup-data)
  - [Dashboard for YouTube Videos](#dashboard-for-youtube-videos)
  - [Connect GAO Reports to Committee Hearings](#connect-gao-reports-to-committee-hearings)
  - [Floor schedule](#floor-schedule)
  - [Committee proceeding Transcripts](#committee-proceeding-transcripts)
  - [Witness database](#witness-database)
  - [Track appropriations notices](#track-appropriations-notices)
  - [Submit appropriations documentation](#submit-appropriations-documentation)
  - [Appropriations bill versions](#appropriations-bill-versions)
  - [CRS reports to HTML](#crs-reports-to-html)
  - [Transform GAO reports into markdown](#transform-gao-reports-into-markdown)
  - [CRS Reports to Wikipedia](#crs-reports-to-wikipedia)
  - [Statements of Disbursements as Data](#statements-of-disbursements-as-data)
  - [Bills to Committee](#bills-to-committee)
  - [Bill Delay Tracker](#bill-delay-tracker)
  - [Congressional job tracker](#congressional-job-tracker)
  - [Write my govtrack newsletter for me](#write-my-govtrack-newsletter-for-me)
  - [Create an alert for resolutions that passed the prior day](#create-an-alert-for-resolutions-that-passed-the-prior-day)
  - [RFPs for congress](#rfps-for-congress)
  - [Transform House Committee spending reports into data](#transform-house-committee-spending-reports-into-data)
  - [Track committee funding levels](#track-committee-funding-levels)
  - [Appropriations line items](#appropriations-line-items)
  - [Line up CBJs and Approps Committee report language](#line-up-cbjs-and-approps-committee-report-language)
- [Completed Project Ideas](#completed-project-ideas)
  - [Github Wiki bookmarklet](#github-wiki-bookmarklet)

<!-- END INDEX -->

# Project Ideas To Do

## Unified Hearing & Markup Data
Congress does not contain all relevant information about hearings in one place, although it has been improving over time..

**Step 1** is to create a spreadsheet that pulls in the following data:
* Hearing date
* Whether it's a hearing or markup
* The title of the proceeding (probably separate column for event ID)
* The name of the committee of jurisdiction (probably separate column for unique ID of the committee(s)) 
* Whether it is a full committee or subcommittee proceeding
* The webpage for the proceeding from the committee
* The webpage for the proceeding from docs.house.gov (if it's the House) // Senate info comes from the senate committee info page (try using the FAI's [Committee Hearings Archive](https://senatecommitteehearings.com/), this has all the Senate committee data in one place)
* Where the video is available (youtube or akami)
* Where you can find the transcript

This is regularly updated as new information is added on: Congress.gov, docs.house.gov, the relevant committee youtube page, the relevant committee webpage

Also note that House committees often forget to put the event ID in the YouTube page, so you'll have to do fuzzy logic to match some of the committee proceeding video names with the official committee proceeding name available on the House or Senate committee pages (or via the Congress.gov API). It looks like [Abigail Haddad has created an excellent proof of concept that could solve this issue](https://abigailhaddad.github.io/hearings/).

**Step 2** is to update a Wiki page (like [this one](https://github.com/DanielSchuman/Policy/wiki/Legislative-Branch-Oversight)) to publish the information as prose and update the hyperlinks as appropriate.

**Step 3** may be to provide notice to the user when new information regarding a relevant committee of jurisdiction is published.

I care particularly about proceedings for House Admin, Senate Rules, and House and Senate Leg Branch Approps. Model output for the wiki could [look like this](https://github.com/DanielSchuman/Policy/wiki/Legislative-Branch-Oversight).

## Dashboard for YouTube Videos
As mentioned in *Unified Hearing & Markup Data*, House committees do not always put the event ID on Youtube videos. (The Senate doesn't publish their proceedings on YouTube.)

The purpose is to either encourage committees to put event IDs in their video descriptions on youtube or alert committees when they've failed to do so.

We should track all the various committee youtube videos and crosscheck them against official event id information either from congress.gov (API?) or docs.house.gov. 

There should be a dashboard that lists all committee names. Under each committee it should indicate how many proceedings the committee has held and whether the youtube video includes the event ID. (If it does not, the video won't show up on congress.gov). We can match the existence of the videos by looking at the date of the video and its title and fuzzy match against official notice of hearings from the committee. Probably should look at video length to make sure it's the full proceeding.

You then want the dashboard that does a few thing
* Ranks committee consistency of putting event ids on videos. Committees with the highest consistency get a good grade, those with low consistency get a bad grade.

* Also consider a feature where once a week the committee is emailed with a list of videos that don't have event IDs, with a link to the youtube page for the video and the event ID they should include.

At the June 2025 Congressional Data Task Force Meeting, the Library of Congress was able to use a tool created by the House Digital Service to identify unlabeled youtube videos with the proper event ID. However, HDS only could provide the data for 2025. This process needs to be run for prior years and provided to the Library for incorporation. We likely will not need this to work for the House in the future.

## Connect GAO Reports to Committee Hearings

GAO reports are often topically relevant to committee hearings. For upcoming (and past hearings), identify which GAO reports are likely to be most relevant to that hearing and identify and link to those reports. Perhaps clean up GAO's summary and share that as well.

The result could be data for an enhanced page for the [congress.gov committee schedule page](https://www.congress.gov/committee-schedule/weekly/2025/09/01), used by GovTrack, or as an API call for those who want context about a particular proceeding.

## Floor schedule

The House and (to a lesser extent the) Senate publish information about upcoming floor schedules. Take that data and infuse it into the already existing committee schedule trackers on congress.gov and possibly govtrack.us.

Turn the week's committee schedule into an ical file.

I've listed the [data sources for floor and committee proceedings on this wiki page](https://github.com/DanielSchuman/Policy/wiki/Leg-Tracking).

## Committee proceeding Transcripts

Committees have proceedings all the time. If you want a transcript you have to wait a year or more from Congress or pay for a private service. Use appropriate tools to create an immediate transcript of the committee proceedings and make them available at a static website. Probably worth typing them in to the House event ID or the akami info for the senate proceedings (look to [https://senatecommitteehearings.com/](https://senatecommitteehearings.com/about/) >> go to the download link.

Further consider creating an automatic summary of what as discussed.

Consider also publishing as an EPUB. 

Also consider connecting the automatic transcripts to *Unified Hearing & Markup Data*.

## Witness database

Create a database of all witnesses in the House and Senate. Give a unique ID to each witness and track identify all the proceedings on which they've testified. Include a transcript of their written remarks, their written testimony, and summaries of both. 

Also, they likely were asked Questions for the Record that would show up in a committee transcript. Pull that information as well.

Don't just track by the witness, but also by the title. For example, "Jane Smith" or "FAA Administrator"

The House is building a witness database, but there's nothing publicly visible at this point.

## Track appropriations notices

It's important to track information about upcoming appropriations proceedings and congress.gov doesn't do this well. The information is generally posted once a week on the house and senate approps committee pages as well as on the 12 subcommittee pages. Information to gather:

* What are the instructions for public witnesses?
* What are the instructions for member offices submitting testimony?
* What's the due date for the public to submit written testimony?
* What's the due date fro the public to request to testify in person?
* What's the date of the public witness testimony?
* What's the date for member offices to request to testify?
* What's the date when written testimony for members is due?
* What's the date members testify in person?
* To whom should this information be communicated?

This information should be added to a spreadsheet. I have a model for [what this looks like right here](https://firstbranchforecast.com/2023/03/15/tracker-fy-2024-approps-testimony-and-hearing-deadlines/).

## Submit appropriations documentation

It's a pain to submit bill text or committee report items to individual member offices, especially when you've got a lot. Their submission templates are google forms that are similar but not the same.

Make it possible to crosswalk a spreadsheet that you've already generated to an individual office's forms. Then have it autofill that form. This will allow the submission of multiple recs for an office without having to do it by hand. And to take the relevant recs and submit to other offices without updating the spreadsheet.

Also make it possible to transform a google doc into the spreadsheet.

## Appropriations bill versions

Appropriators routinely publish bill text and committee reports on their committee websites and it can take a long time for that information to make its way onto congress.gov.

Create a spreadsheet that contains
* The bill text as introduced in subcommittee
* the bill text as reported by subcommittee
* The press release summarizing the committee action
* A link to any amendments offered and adopted at subcommittee
* The bill text as published prior to consideration by the full committee
* The report language as published prior to consideration by full committee
* the bill text as adopted by the full committee
* Any amendments offered, whether adopted, by the committee
* The report language as adopted by the full committee
* In the House, the bill text prior to consideration by the house rules committee
* In the House, the report text prior to consideration by the house rules committee
* In the House, the bill text after consideration by the house rules committee
* In the House, the bill text after consideration by the house rules committee
* the bill text adopted by the house
* the bill text adopted by the senate
* The joint explanatory statement that accompanies the final bill as adopted in either/both chambers

I have a [wiki page](https://github.com/DanielSchuman/Policy/wiki/Legislative-Branch-Appropriations-Documents#fiscal-year-2025---118th-congress-second-session) that tracks this that we can use as an example.

Other features
* It also is useful to know whether/ how bill text or report language has changed as the measure has moved in the chamber
* It is useful to know whether/how the bill text or report language is the same or different between the chambers
* It is helpful to know all the directions given to agencies/offices in the report language
* It is helpful to know when reports are due back from entities in the report language -- this would compile the house and senate and joint explanatory document. It would also look for conflicting language and identify it.

A hard but useful feature:
* Look at report language accompanying approps bills over time to pull together the same or similar sections and display them together. You can see how ideas have evolved over multiple congresses.

## CRS reports to HTML
CRS.Congress.gov is now publishing as of 2025 recent CRS reports as HTML, [available by API](https://gpo.congress.gov/). There are many thousands of older CRS reports that are not publicly available as API, but I have them on my [everycrsreport](everycrsreport.com) website. 

1. Incorporate the newly available CRS reports as HTML onto everycrsreport.com (@joshdata can help with this)
2. Update the older CRS reports for which HTML is not available by running this tool. <-- this is the task

@vdavez built this [committee.report tool](https://github.com/vdavez/committee.report) to transform congressional reports into markdown and then other formats (like HTML). This or a version of it could be modified and used for CRS reports.

Jeff Emmanuel also outlined [a smart approach here](https://x.com/doodlestein/status/1961817172516168098). Not only could you transform to html, you could transform to markdown. You could also categorize the topics for the reports.

Ideally we'd want the reports in markdown so they can be transformed into multiple versions.

Transform them all into epub as well.

In addition, we may want to consider making the old CRS reports available for free or at as low a cost as possible on amazon.com to get rid of the shysters charging 20 bucks a copy.

Consider also using AI to identify the subject matter for the CRS reports and generate tags for the everycrsreport website.

## Transform GAO reports into markdown
GAO reports are published as PDFs. You should be able to read them as epub on your kindle or in whatever format you want.

Does [this tool](https://github.com/vdavez/gao) get us part of the way?

We want to host the GAO reports and publish them. 

## CRS Reports to Wikipedia
Wikipedia is the #1 source for policy information on the internet but it does not incorporate CRS reports as much as it is should.

Use AI and other technologies to help infuse the contents of CRS reports onto the relevant wikipedia pages to improve the quality of articles.

## Statements of Disbursements as Data

The [House's statements of disbursements](https://www.house.gov/the-house-explained/open-government/statement-of-disbursements), and the [senate secretary of the senate reports](https://www.senate.gov/legislative/common/generic/report_secsen.htm), show quarterly and semi-annually spending for the House and Senate. These reports can run thousands of pages long. All the data, that can go back decades, should be converted to structured data spreadsheets. Eventually, they should be cleaned up to provide unique identifiers for individuals and the ability to track data on an annual basis (things like staff turnover, staffer pay, etc.)

Use the pre-existing Sunlight Foundation/ ProPublica scraper tools and turn scanned statements of disbursements into spreadsheet data for House quarterly spending going back to 1980 or so. The old reports [from 1970-2018](https://guides.bpl.org/Congress/Disbursements) are available from the Boston Public Library. The House is publishing more recent info as data, so digitizing these once would be incredibly valuable.

Publish on a bespoke website or share with academic community.

## Bills to Committee

Using historical bill referral patterns, predict which bills will be referred to which committees. Make this available as a dataset or an add-on-app that runs on top of congress.gov or govtrack.us

## Bill Delay Tracker

Keep track of how long it takes congress.gov to create a summary for a bill for which it has published text.

Make it as a dashboard. Look at it several ways:

* count the total number of pages in the bills
* count by the number of bills
* look at the number of bills that have been reported by committee

## Congressional job tracker

Create a bsky feed / spreadsheet that lists all jobs on the hill

Clean and parse the data (probably using AI) from the [House's employment PDF](https://www.house.gov/employment/positions-with-members-and-committees) that comes out weekly
Organize the data [published by the Senate](https://employment.senate.gov/job-vacancies/) for its political and non-political entities
Scrape the House website for [support office job postings](https://www.house.gov/employment/positions-with-other-house-organizations)
Troll USA JOBS for support offices and agencies, such as GAO, LC, CRS, USCP, AOC. You can probably get this from the [USA Jobs API](https://developer.usajobs.gov/)

Keep track of when the items are first posted.

## Write my govtrack newsletter for me

Pull in all the floor information from the House and Senate notices and all the committee schedule information from the committees.

Use AI to transform it into a newsletter (like [this one](https://www.govtrack.us/posts/466/2025-01-03_twelve-bills-will-be-fast-tracked-by-republicans-new-house-rules)) following the model:

1. Here's what's on the House floor this week -- the bills up for a vote, the bills on suspension
2. What's going on in the senate -- bills and noms -- maybe take this from the colloquoy?
3. Here's what's happening in committees in each chamber. Look at total number of hearings/markups in each chamber by frequency of committee, highlighting appropriations and NDAA first, then major nominees

The British weekly [Parliament Matters Bulletin](https://www.hansardsociety.org.uk/news/parliament-matters-bulletin-8-september-2025) would be an ideal outcome for an automatically generated newsletter.

Govtrack's weekly [preview blog](https://www.govtrack.us/posts/515/2025-06-22_this-week-a-152-billion-bill-for-veterans-affairs-military-construction-and-related-agencies) would be a good, MVP model for this.

## Create an alert for resolutions that passed the prior day

The Senate and sometimes the House pass a bunch of sneaky resolutions. Transform the alerts, with the text that's published in the congressional record but not always on congress.gov, into an email alert.

## RFPs for congress

Create an alert for new requests for proposals -- i.e., contracts -- let by the House, Senate, and its support agencies. Tweet them out on bsky and maintain in a spreadsheet.

The data lives on [sam.gov](https://sam.gov/opportunities), but that website is not great. Limit just to leg branch agencies.

## Transform House Committee spending reports into data

House committees report monthly their spending to the House Admin Committee. See [here](https://cha.house.gov/committee-reports)

This is published as PDFs. Have it published as data. Also consider showing each month in a year in a central spreadsheet. Also throw an alert when a committee hasn't submitted their stuff.

Turn the PDF data into spreadsheets and visualize it.

## Track committee funding levels
The House and Senate pass individual resolutions to provide funding for committees. Find those resolutions for each congress, which follow a formula, and pull the data and stick it into a spreadsheet going back in time.

## Appropriations line items

Look at the House and Senate appropriations tables published at the end of the approps committee reports, which show line item spending. Transform those into data tables that track spending by line item going back years. 

At the end of each committee report for [the 12 appropriations subcommittees](https://www.congress.gov/crs-appropriations-status-table) is a table of spending represented in the bill.

For example, from [this Legislative Branch Appropriations Bill for 2025](https://www.congress.gov/118/crpt/hrpt555/CRPT-118hrpt555.pdf), scroll down to [page 46](https://www.congress.gov/118/crpt/hrpt555/CRPT-118hrpt555.pdf#page=46). Once you rotate the page, it looks like this:

![image1](https://github.com/user-attachments/assets/512bff5c-fac8-4bf7-aff8-dda39ff42af4)

And it's followed by a number of similar pages

![image2](https://github.com/user-attachments/assets/3dd09056-59e6-405d-bbb9-fbf1caa942f7)

What I've been doing is manually extracting the data from the House Committee report, the Senate committee report (which has shared items and different items), and then the joint explanatory report (which accompanies the enacted bill) -- and lining it up in a spreadsheet.

Then I've gone back in time and done the same for prior years. When I put all this together, I end up with a spreadsheet that looks a lot like this:

![image3](https://github.com/user-attachments/assets/ab1ccff5-97b1-4113-a78a-c2549c86ee08)

As you can imagine, this is a ton of work to do. There's mistakes that happen when I type things in by hand. And I've only had time to do this for legislative branch appropriations and not the 11 other appropriations committees.

But it appears that giving proper instructions to LLMs, as [Derek Willis](https://github.com/dwillis) [is doing here](https://thescoop.org/archives/2025/06/09/how-openelections-uses-llms/index.html), makes it possible to comparatively easily extract the information from the spreadsheets. Once that's done, it's a matter of comparing line item descriptions (which can be added or dropped over time) to create a complete spreadsheet of spending over time. That can be done with scripts and fuzzy matching.

Fortunately, appropriators make it fairly straightforward to find links to the right committee reports. (https://www.congress.gov/crs-appropriations-status-table)

It'd be a fair amount of work, but once it's done, it'd be incredibly helpful to track spending over time and we wouldn't ever have to go backwards in time again.

## Line up CBJs and Approps Committee report language

Connect each agency's [budget justifications](https://www.usaspending.gov/agency) with appropriations info committee report sections. 

# Completed Project Ideas

## Github Wiki bookmarklet

Create a bookmarklet on firefox that automatically generates an index for a Github wiki page.

Create a new firefox bookmark. In the URL, insert this code

`javascript:(() => {   const textarea = document.getElementById('gollum-editor-body');   if (!textarea) {     alert('%E2%9D%8C Wiki editor not found. Make sure you are editing a wiki page.');     return;   }    let content = textarea.value;   content = content.replace(/<!-- INDEX -->[\s\S]*?<!-- END INDEX -->\n?/m, '');    const lines = content.split('\n');   const toc = [];    for (const line of lines) {     const match = line.match(/^(#{1,6})\s+(.*)/);%20%20%20%20%20if%20(match)%20{%20%20%20%20%20%20%20const%20level%20=%20match[1].length;%20%20%20%20%20%20%20const%20title%20=%20match[2].trim();%20%20%20%20%20%20%20const%20slug%20=%20title%20%20%20%20%20%20%20%20%20.toLowerCase()%20%20%20%20%20%20%20%20%20.replace(/[^\w\s-]/g,%20'')%20%20%20%20%20%20%20%20%20.replace(/\s+/g,%20'-');%20%20%20%20%20%20%20toc.push(`${'%20%20'.repeat(level%20-%201)}-%20[${title}](#${slug})`);%20%20%20%20%20}%20%20%20}%20%20%20%20if%20(!toc.length)%20{%20%20%20%20%20alert('No%20headings%20found%20to%20create%20index.');%20%20%20%20%20return;%20%20%20}%20%20%20%20const%20indexBlock%20=%20`<!--%20INDEX%20-->\n##%20Table%20of%20Contents\n\n${toc.join('\n')}\n\n<!--%20END%20INDEX%20-->\n`;%20%20%20textarea.value%20=%20indexBlock%20+%20content;%20%20%20alert('%E2%9C%85%20Table%20of%20Contents%20inserted%20at%20the%20top.');%20})();`

## Inflation Calculator
* Status: Tool created (but I haven't tested it yet)
* Github page: https://github.com/civictechdc/congressional-tech/tree/main/projects/5.1-inflation-gsheets

Create an inflation calculator for Google sheets drawing on Bureau of Labor Statistics (or another source) to calculate inflation. As inputs you should be able to assign a particular row or column as indicating the starting comparison date (as a year) and a finishing comparison date (as a year). To make this work you should be able to drag down the row to automatically inflate all the elements in that row.

The formula should be something like =(source monetary amount cell, original year to be inflated cell, final year to be inflated cell)