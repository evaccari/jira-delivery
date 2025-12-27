# 🚀 Jira Delivery

> A TypeScript CLI tool that synchronizes and validates consistency between Jira issues and GitLab merge requests to facilitate deliveries.

## 📋 Description

**Jira Delivery Helper** is a command-line tool designed to automate consistency checks between Jira issues marked as "Ready to Deliver" and issue references found in GitLab merge request commits. It generates a detailed markdown report that quickly identifies inconsistencies and issues ready to be delivered.

### Problem Solved

In a development environment where teams use both Jira for task tracking and GitLab for version control, it can be difficult to ensure that:
- All Jira issues marked "Ready to Deliver" are properly referenced in GitLab commits
- All issues mentioned in commits are properly marked as ready to deliver in Jira
- Merge requests are correctly configured before delivery

This tool automates this verification and generates a clear report to facilitate the delivery process.

## ✨ Features

- 🔍 **Automatic Analysis** : Extracts Jira issue numbers from GitLab merge request commits
- ✅ **Cross-validation** : Compares Jira "Ready to Deliver" issues with issues referenced in GitLab
- 📊 **Detailed Report** : Generates a structured markdown report with three categories:
  - **Ready** : Issues present in both systems and ready to deliver
  - **GitLab only** : Issues referenced in GitLab but not marked "Ready to Deliver" in Jira
  - **Jira only** : Issues marked "Ready to Deliver" in Jira but not referenced in GitLab
- 🛡️ **Merge Request Validation** : Verifies that the merge request is correctly configured (source and target branches)
- 🏢 **Multi-team Support** : Team-based configuration with custom GitLab branches and Jira IDs

## 🛠️ Tech Stack

- **TypeScript** : Development language
- **Node.js** : JavaScript runtime
- **GitLab API** (`@gitbeaker/rest`) : GitLab integration
- **Jira API** (`jira-client`) : Jira integration
- **Commander.js** : CLI interface
- **ESLint** : Code linting and quality

## 📦 Installation

### Prerequisites

- Node.js (version compatible with pnpm 10.25.0)
- pnpm 10.25.0
- A GitLab account with an API token (minimum permission: `read_api`)
- A Jira account with an [API token](https://id.atlassian.com/manage-profile/security/api-tokens)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jira-delivery
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   Create a `.env` file at the project root with the following variables:
   ```env
   GITLAB_HOST=gitlab.com
   GITLAB_TOKEN=your_gitlab_token

   JIRA_EMAIL_ADDRESS=your_jira_email
   JIRA_HOST=your_instance.atlassian.net
   JIRA_TOKEN=your_jira_token
   ```

## 🚀 Usage

### Basic Command

```bash
pnpm deliver -p <project> -mr <merge-request-id> -t <team>
```

### Options

- `-p, --project <project>` : **Required** - GitLab project identifier (e.g., `webapp`)
- `-mr, --merge-request <merge-request-id>` : **Required** - GitLab merge request ID
- `-t, --team <team>` : **Required** - Jira team name (default: `foundations`)

### Examples

```bash
# Display help
pnpm deliver --help

# Analyze a merge request for the "foundations" team
pnpm deliver -p webapp -mr 7777 -t foundations

# Using long options
pnpm deliver --project webapp --merge-request 7777 --team foundations
```

### Output

The report is generated in the `output/description.md` file and contains:
- Issues ready to deliver (present in both systems)
- Detected inconsistencies with warnings
- Direct links to Jira issues

## 🔍 Detection Logic

### Issues Considered as "Ready to Deliver"

The script uses the following JQL query to identify issues to deliver:
```jql
"Team[Team]" = <team_id> and status = "Ready to Deliver" order by key
```

### Merge Request Validation

The tool verifies that:
- The merge request exists in the specified GitLab project
- The source branch matches the team's main branch
- The target branch is `develop`

### Issue Extraction from GitLab

Jira issue numbers are extracted from:
- Commit messages
- Commit titles
- Issues must exist in Jira and not be of type "Epic"

## 📁 Project Structure

```
jira-delivery/
├── scripts/
│   └── deliver.ts          # CLI entry point
├── src/
│   ├── constants/          # Configuration constants
│   ├── types/              # TypeScript definitions
│   ├── typeguards/         # Type guards
│   ├── commander.ts        # CLI configuration
│   ├── delivery-helper.ts  # Main logic
│   ├── report.ts           # Report generation
│   └── team.ts             # Team management
├── output/                 # Report output directory
└── package.json
```

## 🧪 Available Scripts

- `pnpm deliver`: Run the delivery tool
- `pnpm lint`: Lint code with auto-fix
- `pnpm typecheck`: Check TypeScript types

## 📝 Notes

- The tool requires appropriate API permissions on GitLab and Jira
- Issues of type "Epic" are automatically excluded from analysis
- The report is always generated in `output/description.md` and serves as a template for the merge request description

## 📖 About

This project demonstrates integration with GitLab and Jira APIs, TypeScript CLI development, and automated report generation. It is not actively maintained.
