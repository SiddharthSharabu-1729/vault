
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
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
} from 'lucide-react'
import { Button } from './ui/button'

interface EditorProps {
    content: string;
    onChange: (richText: string) => void;
    editable?: boolean;
}


const EditorToolbar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-input bg-transparent p-2">
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Heading 1"
                title="Heading 1"
                disabled={!editor.isEditable}
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Heading 2"
                title="Heading 2"
                disabled={!editor.isEditable}
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Heading 3"
                title="Heading 3"
                disabled={!editor.isEditable}
            >
                <Heading3 className="h-4 w-4" />
            </Button>
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
                <Code className="h-4 w-4" />
            </Button>
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
        ],
        content: content,
        editorProps: {
            attributes: {
                class:
                    'prose prose-sm dark:prose-invert max-w-none min-h-[45vh] rounded-b-md border-x border-b border-input bg-transparent px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
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
            <EditorContent editor={editor} className="flex-grow overflow-y-auto" />
        </div>
    )
}
