OBS Studio Broadcast News Lower Thirds Workflow
A lightweight, open-source broadcast graphics overlay workflow built for OBS Studio. This project democratizes broadcast-quality visual overlays—such as dynamic headlines, lower thirds, and scrolling tickers—without requiring expensive enterprise hardware or software suites (like Vizrt, Ross Xpression, or Chyron).

Features
100% Free & Open Source: Built entirely for OBS Studio users without proprietary licensing fees.

Fully Local Execution: Runs completely offline on your local machine using an embedded browser source—no active internet connection required.

Dynamic News Overlays: Real-time editable headlines, news lower thirds, and smooth scrolling ticker messages.

Low System Resource Usage: Lightweight template engine designed to run seamlessly alongside your live stream or recording setup.

Folder Structure
Plaintext
├── assets/             # CSS styling, fonts, and graphical elements
├── scripts/            # JS handlers for dynamic text and ticker routing
├── template.html       # Primary local browser source file for OBS
└── README.md           # Project documentation
Getting Started
Prerequisites
OBS Studio (Version 28.0 or higher recommended)

Any modern web browser (for editing or previewing)

Installation
Clone or Download the Repository:

Bash
git clone https://github.com/your-username/your-repo-name.git
Extract Files: Place the project folder in a dedicated directory on your local machine.

Setting Up in OBS Studio
Open OBS Studio.

In your preferred Scene, click the + button under Sources and select Browser.

Name your source (e.g., News Overlay) and click OK.

Check the box for Local file.

Click Browse and select the template.html file from this repository.

Set the dimensions to match your canvas (e.g., Width: 1920, Height: 1080).

Click OK.

How It Works
Browser Source: Renders the layout and animation elements directly over your live camera or video input inside OBS.

Text Input Layer: Update your dynamic headlines and news tickers in real time by modifying local data feeds or input text layers mapped to the template.

Usage & Customization
Customizing Graphics: Modify the CSS files in the assets/ folder to change color palettes, fonts, or position layouts.

Updating Headlines: Edit the underlying text or script file to feed custom news topics, updates, or ticker items into the visual feed.

License
Distributed under the MIT License. See LICENSE for more information.

Contributing
Contributions, bug reports, and feature requests are welcome! Feel free to open an issue or submit a pull request to help improve this workflow for the community.
