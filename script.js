// Data-first model: edit the structure below to add sections, tasks, or steps.
const runbook = [
  {
    id: "git",
    title: "Git",
    summary: "Version control workflows",
    tasks: [
      {
        title: "Create and push a new branch",
        description: "Start a fresh work item from the latest main branch.",
        steps: [
          "git checkout main",
          "git pull origin main",
          "git checkout -b feature/short-description",
          "git push -u origin feature/short-description"
        ]
      },
      {
        title: "Amend changes to the last commit",
        description: "Amend changes to the last commit without changing the commit message",
        steps: [
          "git add .",
          "git commit --amend --no-edit",
          "git push --force-with-lease"
        ]
      },
      {
        title: "Merge and push a branch to main",
        description: "Merge a branch to main and push the changes to the remote repository.",
        steps: [
          "git switch main",
          "git pull origin main",
          "git merge bug_fix",
          "git add .",
          "git commit -m \"Merge branch bug_fix into main\"",
          "git push origin main"
        ]
      },
      {
        title: "Set global git config",
        description: "Applies to every repo for your OS user, stored in ~/.gitconfig",
        steps: [
          "git config --global user.name \"Tanmay Tyagi\"",
          "git config --global user.email \"tanmay.tyagi@gmail.com\"",
          "git config user.name",
          "git config user.email"
        ]
      },
      {
        title: "To remove all untracked files and directories",
        description: "first inspect and then delete",
        steps: [
          "git clean -nfd",
          "git clean -fd"
        ]
      }
    ]
  },
  {
    id: "sql",
    title: "SQL",
    summary: "Database checks and migrations",
    tasks: [
      {
        title: "Verify connectivity with a health query",
        description: "Confirm credentials and latency without modifying data.",
        steps: [
          'export PGPASSWORD="$DB_PASSWORD"',
          'psql "host=$DB_HOST user=$DB_USER dbname=$DB_NAME sslmode=require" -c "SELECT now() AS server_time, current_user, version();"'
        ]
      },
      {
        title: "Export recent orders to CSV",
        description: "Capture a time-bounded dataset for analysis.",
        steps: [
          'psql "host=$DB_HOST user=$DB_USER dbname=$DB_NAME sslmode=require" -c "\\copy (SELECT * FROM orders WHERE created_at >= now() - interval \'7 days\') TO ./orders.csv CSV HEADER"'
        ]
      }
    ]
  },
  {
    id: "docker",
    title: "Docker",
    summary: "Local container workflows",
    tasks: [
      {
        title: "Build and run the app locally",
        description: "Iterate on the service with local ports and environment variables.",
        steps: [
          "docker build -t app:dev .",
          "docker run --rm -p 3000:3000 --env-file .env app:dev"
        ]
      },
      {
        title: "Clean up stopped containers and dangling images",
        description: "Reclaim disk space after local testing.",
        steps: [
          "docker container prune -f",
          "docker image prune -f"
        ]
      }
    ]
  },
  {
    id: "kafka",
    title: "Kafka",
    summary: "Messaging utilities",
    tasks: [
      {
        title: "Produce a sample event",
        description: "Validate a topic end-to-end with a known payload.",
        steps: [
          'echo \'{"event":"ping","source":"dev"}\' | kafka-console-producer --bootstrap-server localhost:9092 --topic dev.events'
        ]
      },
      {
        title: "Consume the latest messages",
        description: "Tail a topic to observe recent traffic.",
        steps: [
          "kafka-console-consumer --bootstrap-server localhost:9092 --topic dev.events --from-beginning --max-messages 20"
        ]
      },
      {
        title: "Reset a consumer group to the latest offset",
        description: "Recover a stalled consumer without replaying the backlog.",
        steps: [
          "kafka-consumer-groups --bootstrap-server localhost:9092 --group app-dev --topic dev.events --reset-offsets --to-latest --execute"
        ]
      }
    ]
  }
];

const container = document.getElementById("tech-sections");
const navContainer = document.getElementById("section-nav");
const copyFeedbackDuration = 1400;
let activeSectionId = runbook[0]?.id || "";

const buildSection = (section) => {
  const wrapper = document.createElement("article");
  wrapper.className = "tech-section";
  wrapper.id = section.id;

  const header = document.createElement("div");
  header.className = "tech-header";
  header.innerHTML = `<h2>${section.title}</h2><span class="tech-summary">${section.summary}</span>`;

  wrapper.appendChild(header);
  section.tasks.forEach((task) => wrapper.appendChild(buildTask(task)));
  return wrapper;
};

const buildTask = (task) => {
  const card = document.createElement("article");
  card.className = "task-card";

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const description = document.createElement("p");
  description.className = "task-description";
  description.textContent = task.description;

  const stepsList = document.createElement("ol");
  stepsList.className = "step-list";

  task.steps.forEach((stepText) => {
    const step = document.createElement("li");
    step.className = "step";

    const stepBody = document.createElement("div");
    stepBody.className = "step-body";

    const pre = document.createElement("pre");
    pre.className = "copyable";
    pre.setAttribute("tabindex", "0");
    const code = document.createElement("code");
    code.textContent = stepText;
    pre.appendChild(code);

    const triggerCopy = () => handleCopy(stepText, pre);
    pre.addEventListener("click", triggerCopy);
    pre.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        triggerCopy();
      }
    });

    stepBody.append(pre);
    step.append(stepBody);
    stepsList.appendChild(step);
  });

  card.append(title, description, stepsList);
  return card;
};

const handleCopy = async (text, target) => {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      legacyCopy(text);
    }
    markCopied(target);
  } catch (err) {
    console.error("Copy failed", err);
  }
};

const legacyCopy = (text) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
};

const markCopied = (element) => {
  if (element._copyTimeout) {
    clearTimeout(element._copyTimeout);
  }

  element.classList.add("copied");

  element._copyTimeout = setTimeout(() => {
    element.classList.remove("copied");
    element._copyTimeout = null;
  }, copyFeedbackDuration);
};

const renderTabs = () => {
  navContainer.innerHTML = "";
  runbook.forEach((section) => {
    const button = document.createElement("button");
    button.className = "section-tab";
    button.type = "button";
    button.textContent = section.title;
    button.dataset.sectionId = section.id;
    if (section.id === activeSectionId) {
      button.classList.add("active");
    }
    button.addEventListener("click", () => {
      if (activeSectionId !== section.id) {
        activeSectionId = section.id;
        renderSection();
        renderTabs();
      }
    });
    navContainer.appendChild(button);
  });
};

const renderSection = () => {
  container.innerHTML = "";
  const current = runbook.find((section) => section.id === activeSectionId) || runbook[0];
  if (!current) {
    container.textContent = "No sections configured.";
    return;
  }
  container.appendChild(buildSection(current));
};

const render = () => {
  renderTabs();
  renderSection();
};

document.addEventListener("DOMContentLoaded", render);

