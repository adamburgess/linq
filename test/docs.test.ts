import 'source-map-support/register.js'
import { Assert } from 'zora'
import { Project } from 'ts-morph'
import from from '../src/linq.js'

function fixAnswerSegment(segment: string) {
    // remove the leading // from each line. first line removes // => 
    segment = segment.split('\n').map((l, i) => l.substr(i === 0 ? 6 : 3).trim()).join('\n').trim();
    return '(' + segment + ')';
}

function isIterable(obj: unknown): obj is Iterable<unknown> {
    return obj ? typeof (obj as Iterable<unknown>)[Symbol.iterator] === 'function' : false;
}

function commentToCodeAnswerSegments(comment: string) {
    const jsCommentRegex = /```js\n(.+)```/s;
    let code = jsCommentRegex.exec(comment)![1];
    code = code.split('\n').map(line => line.trim().substr(2)).join('\n');

    // now, split it into parts.
    // each part starts with FROM,
    // includes a // =>, and thats it.
    const segments: { code: string, answer: string }[] = [];
    let codeSegment = '';
    let answerSegment = '';
    let inAnswer = false;
    for (let line of code.split('\n')) {
        if (inAnswer) {
            if (!line.startsWith('//')) {
                segments.push({
                    code: codeSegment,
                    answer: fixAnswerSegment(answerSegment)
                });
                inAnswer = false;
                codeSegment = answerSegment = '';
            }
        } else {
            if (line.startsWith('// =>')) {
                // start the answer segment
                inAnswer = true;
            }
        }

        if (inAnswer) {
            // sometimes there is an inline note
            const inlineNote = /(\/\/ => .+)( \(.+\))/
            if (inlineNote.test(line)) {
                line = line.replace(inlineNote, '$1');
            }
            answerSegment += line + '\n';
        }
        else codeSegment += line + '\n';
    }

    if (answerSegment !== '') {
        segments.push({
            code: codeSegment,
            answer: fixAnswerSegment(answerSegment)
        });
    }

    return segments;
}

export default function docs(t: Assert) {
    const project = new Project({
        tsConfigFilePath: './tsconfig.json',
        skipAddingFilesFromTsConfig: true,
    });
    const linqSource = project.addSourceFileAtPath('./src/linq.ts');
    const interfaces = linqSource.getInterfaces();
    // for every interface, get all the methods that have a preceding comment with ```typescript and =>
    const testMethods = from(interfaces)
        .map(interfac => {
            const methods = from(interfac.getMethods())
                .map(m => ({ m, comments: m.getLeadingCommentRanges() }))
                .where(m => m.comments.length > 0)
                .map(m => ({ method: m.m, comment: m.comments[0].getText() }))
                .where(m => m.comment.includes('```js') && m.comment.includes('// =>'))
                .toArray();
            return {
                interfac,
                methods
            }
        })
        .where(im => im.methods.length > 0);

    for (const { interfac, methods } of testMethods) {
        t.test(interfac.getName(), t => {
            for (const { method, comment } of methods) {

                t.test(method.getName() + ':' + method.getStartLineNumber().toString(), t => {
                    const segments = commentToCodeAnswerSegments(comment);

                    for (const { code, answer } of segments) {
                        // ok, nice!
                        const throws = Symbol();
                        let answerEval = eval(answer) as unknown;

                        if (answerEval === throws) {
                            // the code must throw -- but not a syntax error
                            try {
                                eval(code);
                                t.fail('did not throw');
                            } catch (e) {
                                if ((e as Error).toString().includes('SyntaxError')) throw e;

                                t.ok(true);
                            }
                        } else {
                            // ok, it shouldn't throw, so eval it.
                            let codeEval = eval(code) as unknown;

                            if (isIterable(codeEval) && isIterable(answerEval)) {
                                codeEval = Array.from(codeEval);
                                answerEval = Array.from(answerEval);
                            }

                            t.eq(codeEval, answerEval, code + ' equals ' + answer);
                        }
                    }
                });
            }
        });
    }

}
