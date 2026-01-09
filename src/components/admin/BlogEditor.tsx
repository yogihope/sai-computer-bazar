import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Maximize2,
  Type,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const BlogEditor = ({ content, onChange }: BlogEditorProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  const toolbarGroups = [
    {
      name: "History",
      tools: [
        { icon: Undo, label: "Undo", action: "undo" },
        { icon: Redo, label: "Redo", action: "redo" },
      ],
    },
    {
      name: "Headings",
      tools: [
        { icon: Heading1, label: "Heading 1", action: "h1" },
        { icon: Heading2, label: "Heading 2", action: "h2" },
        { icon: Heading3, label: "Heading 3", action: "h3" },
        { icon: Type, label: "Paragraph", action: "p" },
      ],
    },
    {
      name: "Formatting",
      tools: [
        { icon: Bold, label: "Bold", action: "bold" },
        { icon: Italic, label: "Italic", action: "italic" },
        { icon: Underline, label: "Underline", action: "underline" },
      ],
    },
    {
      name: "Lists",
      tools: [
        { icon: List, label: "Bullet List", action: "ul" },
        { icon: ListOrdered, label: "Numbered List", action: "ol" },
        { icon: Quote, label: "Blockquote", action: "quote" },
        { icon: Code, label: "Code Block", action: "code" },
      ],
    },
    {
      name: "Alignment",
      tools: [
        { icon: AlignLeft, label: "Align Left", action: "left" },
        { icon: AlignCenter, label: "Align Center", action: "center" },
        { icon: AlignRight, label: "Align Right", action: "right" },
      ],
    },
    {
      name: "Media",
      tools: [
        { icon: LinkIcon, label: "Insert Link", action: "link" },
        { icon: ImageIcon, label: "Insert Image", action: "image" },
        { icon: Youtube, label: "Embed Video", action: "video" },
      ],
    },
  ];

  const handleToolAction = (action: string) => {
    // In a real implementation, this would integrate with a WYSIWYG library
    console.log("Tool action:", action);
  };

  return (
    <div
      className={`flex flex-col rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : ""
      }`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-border/50 bg-muted/30">
        <TooltipProvider>
          {toolbarGroups.map((group, groupIndex) => (
            <div key={group.name} className="flex items-center">
              {groupIndex > 0 && (
                <Separator orientation="vertical" className="mx-2 h-6" />
              )}
              <div className="flex items-center gap-0.5">
                {group.tools.map((tool) => (
                  <Tooltip key={tool.action}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => handleToolAction(tool.action)}
                      >
                        <tool.icon className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{tool.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}

          <div className="ml-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 hover:bg-primary/10"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative">
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Start writing your amazing blog post here...

You can use markdown-style formatting:
• **bold text** for emphasis
• *italic text* for subtle emphasis
• ## for headings
• - for bullet lists
• 1. for numbered lists
• > for quotes
• ``` for code blocks

Drop images directly into the editor or use the toolbar to insert media."
          className="w-full h-[500px] resize-none border-0 bg-transparent focus-visible:ring-0 p-6 text-base leading-relaxed placeholder:text-muted-foreground/50"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        />

        {/* Floating Character Count */}
        <div className="absolute bottom-4 right-4 flex items-center gap-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
          <span>{wordCount} words</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>{readingTime} min read</span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between p-3 border-t border-border/50 bg-muted/20">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Auto-saving...
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Last saved: Just now</span>
        </div>
      </div>
    </div>
  );
};
