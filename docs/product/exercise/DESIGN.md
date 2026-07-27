<!DOCTYPE html>

<html class="h-full" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>RAMP UP - Exercises</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "tertiary-fixed": "#7ffc97",
                        "surface-container-highest": "#d3e4fe",
                        "on-error-container": "#93000a",
                        "on-background": "#0b1c30",
                        "tertiary-container": "#007f36",
                        "on-secondary-container": "#fffbff",
                        "surface-tint": "#0053db",
                        "on-tertiary": "#ffffff",
                        "surface-dim": "#cbdbf5",
                        "surface-container-low": "#eff4ff",
                        "primary-container": "#2563eb",
                        "on-secondary-fixed-variant": "#5a00c6",
                        "tertiary": "#006329",
                        "on-tertiary-fixed-variant": "#005320",
                        "on-surface-variant": "#434655",
                        "secondary-fixed-dim": "#d2bbff",
                        "on-tertiary-fixed": "#002109",
                        "on-tertiary-container": "#c7ffca",
                        "inverse-primary": "#b4c5ff",
                        "surface-container-lowest": "#ffffff",
                        "on-primary-fixed": "#00174b",
                        "on-surface": "#0b1c30",
                        "secondary": "#712ae2",
                        "primary-fixed": "#dbe1ff",
                        "surface-container-high": "#dce9ff",
                        "secondary-fixed": "#eaddff",
                        "inverse-on-surface": "#eaf1ff",
                        "surface-bright": "#f8f9ff",
                        "outline": "#737686",
                        "background": "#f8f9ff",
                        "on-primary": "#ffffff",
                        "primary": "#004ac6",
                        "inverse-surface": "#213145",
                        "on-error": "#ffffff",
                        "on-primary-container": "#eeefff",
                        "surface": "#f8f9ff",
                        "surface-container": "#e5eeff",
                        "on-primary-fixed-variant": "#003ea8",
                        "outline-variant": "#c3c6d7",
                        "on-secondary-fixed": "#25005a",
                        "tertiary-fixed-dim": "#62df7d",
                        "secondary-container": "#8a4cfc",
                        "primary-fixed-dim": "#b4c5ff",
                        "on-secondary": "#ffffff",
                        "surface-variant": "#d3e4fe",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "gutter": "24px",
                        "container-max": "1280px",
                        "base": "4px",
                        "2xl": "48px",
                        "xs": "4px",
                        "margin-mobile": "16px",
                        "lg": "24px",
                        "sm": "8px",
                        "md": "16px",
                        "3xl": "64px",
                        "xl": "32px"
                    },
                    "fontFamily": {
                        "headline-sm": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "body-lg": ["Inter"],
                        "label-sm": ["Inter"],
                        "headline-lg": ["Inter"],
                        "label-md": ["Inter"],
                        "headline-md": ["Inter"],
                        "code": ["monospace"],
                        "body-sm": ["Inter"],
                        "body-md": ["Inter"]
                    },
                    "fontSize": {
                        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
                        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "700" }],
                        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "label-md": ["14px", { "lineHeight": "20px", "fontWeight": "600" }],
                        "headline-md": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                        "code": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }]
                    }
                }
            }
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .shadow-soft {
            box-shadow: 0px 1px 3px 0px rgba(15, 23, 42, 0.05), 0px 1px 2px -1px rgba(15, 23, 42, 0.05);
        }
        body {
            background-color: #F8FAFC;
        }
    </style>
</head>
<body class="h-full flex text-on-surface antialiased bg-surface-lowest">
<!-- SideNavBar Container -->
<nav aria-label="Sidebar" class="hidden md:flex flex-col gap-sm py-lg w-64 z-50 fixed left-0 top-0 h-full bg-surface border-r border-outline-variant">
<div class="px-md pb-md">
<h1 class="text-headline-md font-headline-md font-black tracking-tight text-primary">RAMP UP</h1>
<p class="text-body-sm font-body-sm text-on-surface-variant">Engineering Portal</p>
</div>
<div class="flex flex-col gap-xs flex-1">
<a class="flex items-center gap-md text-on-surface-variant px-md py-sm mx-sm hover:bg-surface-container-low rounded-lg transition-all" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span class="text-body-md font-body-md">Dashboard</span>
</a>
<a class="flex items-center gap-md text-on-surface-variant px-md py-sm mx-sm hover:bg-surface-container-low rounded-lg transition-all" href="#">
<span class="material-symbols-outlined" data-icon="menu_book">menu_book</span>
<span class="text-body-md font-body-md">Curriculum</span>
</a>
<!-- Active State -->
<a class="flex items-center gap-md bg-primary-container text-on-primary-container rounded-lg px-md py-sm mx-sm translate-x-1 transition-transform duration-150" href="#">
<span class="material-symbols-outlined" data-icon="code" style="font-variation-settings: 'FILL' 1;">code</span>
<span class="text-body-md font-body-md font-semibold">Exercises</span>
</a>
<a class="flex items-center gap-md text-on-surface-variant px-md py-sm mx-sm hover:bg-surface-container-low rounded-lg transition-all" href="#">
<span class="material-symbols-outlined" data-icon="leaderboard">leaderboard</span>
<span class="text-body-md font-body-md">Leaderboard</span>
</a>
</div>
<div class="mt-auto px-md pt-lg border-t border-outline-variant">
<div class="flex items-center gap-sm">
<div class="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">JD</div>
<div class="flex flex-col">
<span class="text-label-md font-label-md">John Doe</span>
<span class="text-label-sm font-label-sm text-on-surface-variant">Junior Engineer</span>
</div>
</div>
</div>
</nav>
<!-- Main Content Area -->
<div class="flex-1 flex flex-col md:ml-64 w-full max-w-[calc(100%-256px)] min-h-screen">
<!-- TopNavBar -->
<header class="flex justify-between items-center w-full px-lg h-16 bg-surface border-b border-outline-variant shadow-sm z-40 sticky top-0">
<div class="flex-1">
<!-- Mobile Menu Button (Hidden on Desktop) -->
<button class="md:hidden text-on-surface-variant p-sm rounded-full hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined">menu</span>
</button>
<!-- Context Title -->
<div class="hidden md:flex items-center gap-sm text-on-surface-variant">
<span class="text-label-md font-label-md">React Mastery</span>
<span class="material-symbols-outlined text-[16px]">chevron_right</span>
<span class="text-label-md font-label-md">Building Reusable React Components</span>
</div>
</div>
<div class="flex items-center gap-sm">
<button class="text-on-surface-variant p-sm rounded-full hover:bg-surface-container transition-colors duration-200 scale-95 active:scale-90 transition-transform">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button class="text-on-surface-variant p-sm rounded-full hover:bg-surface-container transition-colors duration-200 scale-95 active:scale-90 transition-transform">
<span class="material-symbols-outlined" data-icon="help_outline">help_outline</span>
</button>
</div>
</header>
<!-- Main Canvas -->
<main class="flex-1 overflow-y-auto p-lg lg:p-2xl w-full max-w-container-max mx-auto bg-[#F8FAFC]">
<!-- Header Section -->
<div class="mb-lg" id="ExerciseListContainer">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
<div class="flex flex-col gap-sm">
<p class="text-label-md font-label-md text-primary tracking-wider uppercase">Lesson 4</p>
<h2 class="text-headline-lg font-headline-lg text-on-background">Exercises for: Building Reusable React Components</h2>
<p class="text-body-lg font-body-lg text-on-surface-variant max-w-2xl">Apply component composition, render props, and custom hooks to build scalable UI elements.</p>
</div>
<div class="flex flex-col gap-xs text-right hidden md:flex">
<span class="text-label-md font-label-md text-on-surface-variant">Course Progress: 65%</span>
<span class="text-label-sm font-label-sm text-on-surface-variant">Exercise 2 of 4</span>
</div>
</div>
<!-- Filter Tabs -->
<div class="flex flex-wrap gap-xs border-b border-outline-variant pb-base">
<button class="px-md py-sm text-label-md font-label-md text-primary border-b-2 border-primary -mb-[5px] transition-colors">All</button>
<button class="px-md py-sm text-label-md font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-t-lg transition-colors">Not Started</button>
<button class="px-md py-sm text-label-md font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-t-lg transition-colors">Submitted</button>
<button class="px-md py-sm text-label-md font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-t-lg transition-colors flex items-center gap-xs">
                        Needs Changes
                        <span class="bg-error-container text-on-error-container text-[10px] px-2 py-0.5 rounded-full font-bold">1</span>
</button>
<button class="px-md py-sm text-label-md font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-t-lg transition-colors">Passed</button>
</div>
</div>
<!-- Exercise Grid -->
<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-md">
<!-- Card 1: In Progress -->
<div class="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-soft overflow-hidden flex flex-col hover:border-primary-container transition-colors duration-200 cursor-pointer group">
<div class="p-md flex-1">
<div class="flex justify-between items-start mb-sm">
<div class="flex gap-xs">
<span class="bg-surface-container-high text-on-surface text-label-sm font-label-sm px-2 py-1 rounded">Medium</span>
<span class="bg-primary-fixed text-on-primary-fixed text-label-sm font-label-sm px-2 py-1 rounded flex items-center gap-xs">
<span class="material-symbols-outlined text-[14px]">sync</span>
                                    In Progress
                                </span>
</div>
<span class="text-label-sm font-label-sm text-on-surface-variant flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px]">schedule</span>
                                45 min
                            </span>
</div>
<h3 class="text-headline-sm font-headline-sm text-on-surface mb-xs group-hover:text-primary transition-colors">Refactor a Course Card</h3>
<p class="text-body-sm font-body-sm text-on-surface-variant line-clamp-2 mb-md">Take an existing monolithic Course Card component and refactor it using the compound component pattern for better flexibility.</p>
<!-- Progress -->
<div class="mt-auto">
<div class="flex justify-between text-label-sm font-label-sm mb-xs text-on-surface-variant">
<span>Tests Passing</span>
<span>3/5</span>
</div>
<div class="w-full bg-surface-container h-2 rounded-full overflow-hidden">
<div class="bg-primary h-full rounded-full" style="width: 60%"></div>
</div>
</div>
</div>
<div class="bg-surface-bright border-t border-outline-variant p-sm flex justify-between items-center">
<span class="text-label-sm font-label-sm text-on-surface-variant">Started 2 days ago</span>
<button class="bg-primary text-on-primary px-md py-sm rounded-md text-label-md font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">Continue Coding</button>
</div>
</div>
<!-- Card 2: Not Started -->
<div class="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-soft overflow-hidden flex flex-col hover:border-primary-container transition-colors duration-200 cursor-pointer group">
<div class="p-md flex-1">
<div class="flex justify-between items-start mb-sm">
<div class="flex gap-xs">
<span class="bg-surface-container-high text-on-surface text-label-sm font-label-sm px-2 py-1 rounded text-tertiary-container">Easy</span>
<span class="bg-surface-variant text-on-surface-variant text-label-sm font-label-sm px-2 py-1 rounded">Not Started</span>
</div>
<span class="text-label-sm font-label-sm text-on-surface-variant flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px]">schedule</span>
                                20 min
                            </span>
</div>
<h3 class="text-headline-sm font-headline-sm text-on-surface mb-xs group-hover:text-primary transition-colors">Extract Icon Component</h3>
<p class="text-body-sm font-body-sm text-on-surface-variant line-clamp-2 mb-md">Create a robust, reusable SVG icon wrapper component that handles dynamic sizing and color inheritance.</p>
<div class="mt-auto">
<div class="flex items-center gap-sm text-body-sm font-body-sm text-on-surface-variant bg-surface-container-low p-sm rounded border border-outline-variant border-dashed">
<span class="material-symbols-outlined text-[18px]">lightbulb</span>
<span>Requires knowledge of SVG props</span>
</div>
</div>
</div>
<div class="bg-surface-bright border-t border-outline-variant p-sm flex justify-end">
<button class="text-primary border border-primary px-md py-sm rounded-md text-label-md font-label-md hover:bg-primary-fixed transition-colors">Start Exercise</button>
</div>
</div>
<!-- Card 3: Needs Changes -->
<div class="bg-surface-container-lowest rounded-lg border border-error shadow-soft overflow-hidden flex flex-col cursor-pointer group relative">
<!-- Subtle Error Indicator Line -->
<div class="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
<div class="p-md flex-1 pl-md">
<div class="flex justify-between items-start mb-sm">
<div class="flex gap-xs">
<span class="bg-surface-container-high text-on-surface text-label-sm font-label-sm px-2 py-1 rounded text-on-error-container">Hard</span>
<span class="bg-error-container text-on-error-container text-label-sm font-label-sm px-2 py-1 rounded flex items-center gap-xs">
<span class="material-symbols-outlined text-[14px]">warning</span>
                                    Needs Changes
                                </span>
</div>
<span class="text-label-sm font-label-sm text-on-surface-variant flex items-center gap-xs">
<span class="material-symbols-outlined text-[16px]">schedule</span>
                                60 min
                            </span>
</div>
<h3 class="text-headline-sm font-headline-sm text-on-surface mb-xs group-hover:text-primary transition-colors">Composition Pattern</h3>
<p class="text-body-sm font-body-sm text-on-surface-variant line-clamp-2 mb-md">Design a highly flexible Modal component using Context API and composition to avoid prop drilling.</p>
<div class="mt-auto bg-error-container/20 p-sm rounded border border-error-container text-body-sm font-body-sm text-on-surface">
<strong class="font-semibold block mb-xs text-label-sm">Reviewer Feedback:</strong>
<p class="line-clamp-2 text-label-sm">"Great start, but consider how the Modal handles focus trapping for accessibility. Check line 42."</p>
</div>
</div>
<div class="bg-surface-bright border-t border-outline-variant p-sm flex justify-between items-center">
<span class="text-label-sm font-label-sm text-on-surface-variant">Reviewed today</span>
<div class="flex gap-sm">
<button class="text-on-surface-variant px-md py-sm rounded-md text-label-md font-label-md hover:bg-surface-container transition-colors">View Review</button>
<button class="bg-primary text-on-primary px-md py-sm rounded-md text-label-md font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">Update Submission</button>
</div>
</div>
</div>
</div>
</main>
</div>
</body></html>