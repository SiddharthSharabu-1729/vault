
'use client';

import React, { useState, useEffect } from 'react';
import type { VaultEntry, Category } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Editor } from '@/components/editor';
import { PlusCircle, Save, Trash2, LoaderCircle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import TurndownService from 'turndown';
import { tables } from 'turndown-plugin-gfm';


interface NotesViewProps {
    notes: VaultEntry[];
    categories: Category[];
    onAddEntry: (newEntry: Omit<VaultEntry, 'id'>, masterPassword: string) => void;
    onUpdateEntry: (updatedEntry: VaultEntry) => void;
    onDeleteEntry: (id: string, title: string, type: string) => void;
    activeCategorySlug?: string;
}

export function NotesView({ notes, categories, onAddEntry, onUpdateEntry, onDeleteEntry, activeCategorySlug }: NotesViewProps) {
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [activeNote, setActiveNote] = useState<VaultEntry | null>(null);
    const [editorContent, setEditorContent] = useState('');
    const [editorTitle, setEditorTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [turndownService, setTurndownService] = useState<TurndownService | null>(null);

    const { toast } = useToast();
    
    useEffect(() => {
        const service = new TurndownService({ headingStyle: 'atx' });
        service.use(tables);
        setTurndownService(service);
    }, []);

    // EFFECT 1: Auto-select the first note when the list loads or changes.
    // This is the key fix. It reacts to the notes prop changing.
    useEffect(() => {
        // Condition: notes are available AND (no note is selected OR the selected note is no longer in the list)
        const noteExists = notes.some(n => n.id === selectedNoteId);
        if (notes.length > 0 && !noteExists) {
            setSelectedNoteId(notes[0].id);
        } else if (notes.length === 0) {
            setSelectedNoteId(null);
        }
    }, [notes, selectedNoteId]);


    // EFFECT 2: When the selection changes, update the active note and editor content.
    useEffect(() => {
        if (selectedNoteId) {
            const note = notes.find(n => n.id === selectedNoteId);
            setActiveNote(note || null);
            setEditorContent(note?.notes || '');
            setEditorTitle(note?.title || '');
        } else {
            setActiveNote(null);
            setEditorContent('');
            setEditorTitle('');
        }
    }, [selectedNoteId, notes]);


    const handleSelectNote = (noteId: string) => {
        setSelectedNoteId(noteId);
    };

    const handleNewNote = () => {
        const defaultCategory = activeCategorySlug ?? (categories[0]?.slug || 'personal');
        
        const newNote: Omit<VaultEntry, 'id'> = {
            type: 'note',
            title: 'New Note',
            category: defaultCategory,
            icon: 'StickyNote',
            notes: '<p>Start writing your new note here...</p>',
        };
        
        // This function doesn't need a real password for notes.
        onAddEntry(newNote, 'DUMMY_PASSWORD_FOR_NOTE');
    };

    const handleSaveNote = async () => {
        if (!activeNote) {
            toast({
                variant: 'destructive',
                title: 'No note selected',
                description: 'Please select or create a note to save.',
            });
            return;
        }

        if (!editorTitle.trim()) {
            toast({
                variant: 'destructive',
                title: 'Title is required',
                description: 'Please provide a title for your note.',
            });
            return;
        }

        setIsSaving(true);
        const updatedNote = {
            ...activeNote,
            title: editorTitle,
            notes: editorContent,
        };
        
        try {
            await onUpdateEntry(updatedNote);
            // Parent component will toast success
        } catch (error) {
            // Parent component will toast error
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDeleteNote = () => {
        if (!activeNote) return;
        onDeleteEntry(activeNote.id, activeNote.title, 'note');
    };

    const handleDownloadNote = () => {
        if (!activeNote || !turndownService) {
            toast({
                variant: 'destructive',
                title: 'Cannot Download Note',
                description: 'Please select a note to download.',
            });
            return;
        }

        const markdown = turndownService.turndown(editorContent);
        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeTitle = editorTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${safeTitle || 'note'}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({
            title: 'Note Downloaded',
            description: `"${editorTitle}" has been downloaded as a Markdown file.`,
        });
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[60vh]">
            {/* Note List Pane (Left Side) */}
             <div className="md:col-span-1 lg:col-span-1 border rounded-lg">
                <div className="p-4 border-b">
                    <Button onClick={handleNewNote} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Note
                    </Button>
                </div>
                <ScrollArea className="h-[calc(60vh-60px)]">
                    <div className="p-2">
                        {notes.length > 0 ? (
                            notes.map(note => (
                                <button
                                    key={note.id}
                                    onClick={() => handleSelectNote(note.id)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-lg mb-1 transition-colors",
                                        selectedNoteId === note.id ? "bg-muted" : "hover:bg-muted/50"
                                    )}
                                >
                                    <h4 className="font-semibold truncate">{note.title}</h4>
                                    <p className="text-xs text-muted-foreground truncate"
                                      dangerouslySetInnerHTML={{ __html: note.notes?.replace(/<[^>]+>/g, ' ').substring(0, 100) || 'No content...' }}
                                    />
                                </button>
                            ))
                        ) : (
                           <div className="p-4 text-center">
                                <p className="text-sm text-muted-foreground">No notes here.</p>
                           </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Editor Pane (Right Side) */}
            <div className="md:col-span-2 lg:col-span-3 flex flex-col border rounded-lg p-4">
                {notes.length > 0 || activeNote ? (
                    <>
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                           <input
                                type="text"
                                value={editorTitle}
                                onChange={(e) => setEditorTitle(e.target.value)}
                                placeholder="Note Title"
                                className="text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 flex-grow min-w-[200px]"
                                disabled={!activeNote}
                           />
                            <div className="flex items-center gap-2">
                                <Button onClick={handleSaveNote} disabled={isSaving || !activeNote}>
                                    {isSaving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {isSaving ? 'Saving...' : 'Save'}
                                </Button>
                                 <Button onClick={handleDownloadNote} variant="outline" disabled={!activeNote}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={!activeNote}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete &quot;{activeNote?.title}&quot;?</AlertDialogTitle>
                                            <AlertDialogDescription>This action cannot be undone. This will permanently delete this note.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteNote} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                        <div className="flex-grow">
                             <Editor
                                content={editorContent}
                                onChange={setEditorContent}
                                editable={!!activeNote}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-muted-foreground mb-4">You have no notes in this category.</p>
                        <Button onClick={handleNewNote}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Your First Note
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
