
'use client'

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useCallback, useEffect } from 'react'
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Code,
    Minus,
    Undo,
    Redo,
    Underline,
    SquareCode,
    ListTodo,
    Table,
    Pilcrow,
    ChevronDown,
    AlignCenter,
    AlignLeft,
    AlignRight,
    Palette,
    Highlighter,
} from 'lucide-react'
import { Button } from './ui/button'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import TiptapLink from '@tiptap/extension-link'
import TiptapTable from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TiptapUnderline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Input } from './ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


interface EditorProps {
    content: string;
    onChange: (richText: string) => void;
    editable?: boolean;
}


const EditorToolbar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        // cancelled
        if (url === null) {
            return
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        // update link
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }, [editor])

    return (
        <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-input bg-transparent p-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 px-2" disabled={!editor.isEditable}>
                         <span className="text-xs">
                           { editor.isActive('heading', { level: 1 }) ? 'Heading 1' :
                             editor.isActive('heading', { level: 2 }) ? 'Heading 2' :
                             editor.isActive('heading', { level: 3 }) ? 'Heading 3' :
                           'Paragraph' }
                        </span>
                        <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()} disabled={!editor.isEditable}>
                        <Pilcrow className="h-4 w-4 mr-2" /> Paragraph
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} disabled={!editor.isEditable}>
                        <Heading1 className="h-4 w-4 mr-2" /> Heading 1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={!editor.isEditable}>
                         <Heading2 className="h-4 w-4 mr-2" /> Heading 2
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} disabled={!editor.isEditable}>
                         <Heading3 className="h-4 w-4 mr-2" /> Heading 3
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="mx-1 h-6 w-px bg-border" />
            <Button
                onClick={() => editor.chain().focus().toggleBold().run()}
                variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Bold"
                title="Bold"
                disabled={!editor.isEditable}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Italic"
                title="Italic"
                disabled={!editor.isEditable}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Underline"
                title="Underline"
                disabled={!editor.isEditable}
            >
                <Underline className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Strikethrough"
                title="Strikethrough"
                disabled={!editor.isEditable}
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <div className="mx-1 h-6 w-px bg-border" />
             <Popover>
                <PopoverTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Text Color"
                        title="Text Color"
                        disabled={!editor.isEditable}
                    >
                        <Palette className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                    <div className="flex flex-col gap-1">
                        <Input type="color" className="p-0"
                            onInput={(event: React.ChangeEvent<HTMLInputElement>) => editor.chain().focus().setColor(event.target.value).run()}
                            value={editor.getAttributes('textStyle').color || '#000000'}
                        />
                        <Button variant="ghost" className="justify-start p-2 h-auto" onClick={() => editor.chain().focus().unsetColor().run()}>
                            Reset Color
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
            <Button
                onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffcc00' }).run()}
                variant={editor.isActive('highlight', { color: '#ffcc00' }) ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Highlight"
                title="Highlight"
                disabled={!editor.isEditable}
            >
                <Highlighter className="h-4 w-4" />
            </Button>
            <div className="mx-1 h-6 w-px bg-border" />
            <Button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'}
                size="icon"
                title="Align Left"
                disabled={!editor.isEditable}
            >
               <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'}
                size="icon"
                title="Align Center"
                disabled={!editor.isEditable}
            >
               <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'}
                size="icon"
                title="Align Right"
                disabled={!editor.isEditable}
            >
               <AlignRight className="h-4 w-4" />
            </Button>
            <div className="mx-1 h-6 w-px bg-border" />
            <Button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Bullet List"
                title="Bullet List"
                disabled={!editor.isEditable}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Ordered List"
                title="Ordered List"
                disabled={!editor.isEditable}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
             <Button
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                variant={editor.isActive('taskList') ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Task List"
                title="Task List"
                disabled={!editor.isEditable}
            >
                <ListTodo className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Blockquote"
                title="Blockquote"
                disabled={!editor.isEditable}
            >
                <Quote className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Code Block"
                title="Code Block"
                disabled={!editor.isEditable}
            >
                <SquareCode className="h-4 w-4" />
            </Button>
             <Popover>
                <PopoverTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Table Menu"
                        title="Table Menu"
                        disabled={!editor.isEditable}
                    >
                        <Table className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                    <div className="flex flex-col gap-1">
                        <Button variant="ghost" className="justify-start p-2 h-auto" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Insert table</Button>
                        <Button variant="ghost" className="justify-start p-2 h-auto" onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()}>Add column before</Button>
                        <Button variant="ghost" className="justify-start p-2 h-auto" onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()}>Add column after</Button>
                        <Button variant="ghost" className="justify-start p-2 h-auto" onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()}>Delete column</Button>
                        <Button variant="ghost" className="justify-start p-2 h-auto" onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()}>Add row before</Button>
                        <Button variant="ghost" className="justify-start p-2 h-auto" onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()}>Add row after</Button>
                        <Button variant="ghost" className="justify-start p-2 h-auto" onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()}>Delete row</Button>
                        <Button variant="ghost" className="justify-start p-2 h-auto" onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()}>Delete table</Button>
                        <Button variant="ghost" className="justify-start p-2 h-auto" onClick={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()}>Merge cells</Button>
                        <Button variant="ghost" className="justify-start p-2 h-auto" onClick={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()}>Split cell</Button>
                        <Button variant="ghost" className="justify-start p-2 h-auto" onClick={() => editor.chain().focus().toggleHeaderColumn().run()} disabled={!editor.can().toggleHeaderColumn()}>Toggle header column</Button>
                        <Button variant="ghost" className="justify-start p-2 h-auto" onClick={() => editor.chain().focus().toggleHeaderRow().run()} disabled={!editor.can().toggleHeaderRow()}>Toggle header row</Button>
                        <Button variant="ghost" className="justify-start p-2 h-auto" onClick={() => editor.chain().focus().toggleHeaderCell().run()} disabled={!editor.can().toggleHeaderCell()}>Toggle header cell</Button>
                    </div>
                </PopoverContent>
            </Popover>

             <Button
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                size="icon"
                variant="ghost"
                aria-label="Horizontal Rule"
                title="Horizontal Rule"
                disabled={!editor.isEditable}
            >
                <Minus className="h-4 w-4" />
            </Button>
            <div className="mx-1 h-6 w-px bg-border" />
            <Button
                onClick={() => editor.chain().focus().undo().run()}
                size="icon"
                variant="ghost"
                aria-label="Undo"
                title="Undo"
                disabled={!editor.can().undo() || !editor.isEditable}
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().redo().run()}
                size="icon"
                variant="ghost"
                aria-label="Redo"
                title="Redo"
                disabled={!editor.can().redo() || !editor.isEditable}
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    )
}


export function Editor({ content, onChange, editable = true }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                bulletList: {
                    itemTypeName: 'listItem',
                    HTMLAttributes: {
                        class: 'list-disc pl-4',
                    },
                },
                orderedList: {
                    itemTypeName: 'listItem',
                    HTMLAttributes: {
                        class: 'list-decimal pl-4',
                    },
                },
                blockquote: {
                    HTMLAttributes: {
                        class: 'border-l-4 border-primary pl-4 italic',
                    }
                },
                codeBlock: {
                     HTMLAttributes: {
                        class: 'bg-muted text-muted-foreground rounded-md p-4 my-2 text-sm',
                    }
                }
            }),
            TiptapUnderline,
            TiptapLink.configure({
                openOnClick: false,
                autolink: true,
            }),
            TiptapTable.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
              }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class:
                    'prose prose-sm max-w-none min-h-[45vh] rounded-b-md border-x border-b border-input bg-white text-black px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            },
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML())
        },
        editable: editable,
    });

    useEffect(() => {
        if (editor && editor.isEditable !== editable) {
            editor.setEditable(editable);
        }
    }, [editable, editor]);

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className="flex flex-col h-full">
            <EditorToolbar editor={editor} />
             {editor && <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                <div className="flex gap-1 bg-background border shadow-md p-1 rounded-md">
                    <Button size="icon" variant="ghost" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}>
                        <Strikethrough className="h-4 w-4" />
                    </Button>
                </div>
            </BubbleMenu>}
            <EditorContent editor={editor} className="flex-grow overflow-y-auto" />
        </div>
    )
}
